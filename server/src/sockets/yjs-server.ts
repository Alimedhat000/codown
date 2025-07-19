import fs from 'fs/promises';
import { Server as HTTPServer } from 'http';
import type { DebouncedFunc } from 'lodash';
import debounce from 'lodash/debounce.js';
import path from 'path';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';

// Create a directory for Yjs state if it doesn't exist
const STORE_DIR = path.join(process.cwd(), '.yjs-state');
await fs.mkdir(STORE_DIR, { recursive: true });

//! This should be chaned to have caching/db instead of in-memory storage
//a map to hold Yjs documents in memory
const docs = new Map<
  string,
  {
    doc: Y.Doc;
    saveFn: DebouncedFunc<() => Promise<void>>;
    timeout?: NodeJS.Timeout;
  }
>();

function getDocPath(name: string) {
  return path.join(STORE_DIR, `${name}.bin`);
}

// Creates a WebSocket server that attaches to an existing HTTP server
export function setupYjsWebSocketServer(httpServer: HTTPServer) {
  const wss = new WebSocketServer({ server: httpServer });

  // listens for connections
  wss.on('connection', async (conn, req) => {
    // extract the document name from the request URL
    const name = req.url?.slice(1) || 'default';
    if (!docs.has(name)) {
      const doc = new Y.Doc();
      const updatePath = getDocPath(name);

      try {
        const data = await fs.readFile(updatePath);
        applyUpdate(doc, new Uint8Array(data));
        console.log(`Loaded Y.Doc from ${updatePath}`);
      } catch {
        /* first-load */
      }
      // Creates a function that saves the document to disk
      const saveFn: DebouncedFunc<() => Promise<void>> = debounce(async () => {
        const update = encodeStateAsUpdate(doc);
        await fs.writeFile(updatePath, Buffer.from(update));
        console.log(`Saved Y.Doc to ${updatePath}`);
      }, 1000);

      docs.set(name, { doc, saveFn });
    }

    const { doc, saveFn } = docs.get(name)!;

    // listens to client updates and applies them to the Y.Doc
    conn.on('message', (m: Buffer) => {
      const u = new Uint8Array(m);
      applyUpdate(doc, u);
      saveFn();
      wss.clients.forEach(client => {
        if (client !== conn && client.readyState === conn.OPEN) client.send(u);
      });
    });

    const updateHandler = (u: Uint8Array) => {
      wss.clients.forEach(client => {
        if (client.readyState === conn.OPEN) client.send(u);
      });
    };
    // broadcast the update to all connected clients
    doc.on('update', updateHandler);

    // clean up when the connection is closed
    conn.on('close', () => {
      doc.off('update', updateHandler);
      // schedule unload and final save
      docs.get(name)!.timeout = setTimeout(async () => {
        await saveFn.flush();
        docs.delete(name);
        console.log(`Unloaded Y.Doc ${name} from memory`);
      }, 300_000); // unload after 5 min inactivity
    });

    console.log(`Client connected to Y.Doc "${name}"`);
  });

  console.log('✅ Yjs WebSocket server ready');
}
