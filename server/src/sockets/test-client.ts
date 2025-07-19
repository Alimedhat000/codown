import readline from 'readline';
import WebSocket from 'ws';
import * as Y from 'yjs';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';

// Setup terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '💬 You: ',
});

const doc = new Y.Doc();
const yText = doc.getText('chat');

// Observe remote updates
yText.observe(() => {
  console.clear();
  console.log('📡 Chatroom:\n');
  console.log(yText.toString());
  rl.prompt();
});

const ws = new WebSocket('ws://localhost:5001/chat-room');

ws.binaryType = 'arraybuffer';

ws.on('open', () => {
  console.log('✅ Connected to chatroom');
  ws.send(encodeStateAsUpdate(doc));
  rl.prompt();
});

ws.on('message', data => {
  applyUpdate(doc, new Uint8Array(data as ArrayBuffer));
});

rl.on('line', line => {
  yText.insert(yText.length, `\n🧑 ${line}`);
  const update = encodeStateAsUpdate(doc);
  ws.send(update);
});
