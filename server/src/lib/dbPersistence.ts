import { Database } from '@hocuspocus/extension-database';
import * as Y from 'yjs';

import { prisma } from '@/lib/prisma';
import { slugIDtoFullID } from '@/utils/slugIDtoFullID';

export const dbPersistence = new Database({
  fetch: async ({ documentName }) => {
    try {
      const id = await slugIDtoFullID(documentName);
      // Fetch the Yjs document state from the database
      const record = await prisma.yjsDocumentState.findFirst({
        where: {
          documentId: id,
        },
        select: {
          documentId: true,
          state: true,
          updatedAt: true,
        },
      });

      if (!record || !record.state) {
        return null;
      }

      // Ensure state is properly converted to Uint8Array
      const state = record.state instanceof Buffer ? new Uint8Array(record.state) : record.state;

      return state;
    } catch (error) {
      console.error(`Failed to fetch document ${documentName}:`, error);
      // Return null to let Hocuspocus handle gracefully
      return null;
    }
  },

  store: async ({ documentName, state }) => {
    try {
      const id = await slugIDtoFullID(documentName);
      const existing = await prisma.yjsDocumentState.findUnique({
        where: { documentId: id },
      });

      // Rebuild Y.Doc from binary state to extract plain text
      const ydoc = new Y.Doc();
      Y.applyUpdate(ydoc, state);
      const plainText = ydoc.getText('content').toString();
      console.log(`Storing document: ${documentName}, ID: ${id}, Content Length: ${plainText.length}`);

      if (existing) {
        // Update existing YjsDocumentState
        await prisma.yjsDocumentState.update({
          where: { documentId: id },
          data: {
            state: Buffer.from(state),
            version: { increment: 1 },
          },
        });

        // Update Document content snapshot
        await prisma.document.update({
          where: { id: id },
          data: { content: plainText },
        });
      } else {
        // Check if a Document exists that matches the docName prefix
        const documentExists = await prisma.document.findFirst({
          where: {
            id: id,
          },
        });

        if (documentExists) {
          // Create new YjsDocumentState entry for this document
          await prisma.yjsDocumentState.create({
            data: {
              documentId: documentExists.id,
              state: Buffer.from(state),
            },
          });

          // Also update the Document content snapshot
          await prisma.document.update({
            where: { id: documentExists.id },
            data: { content: plainText },
          });
        } else {
          console.warn(`No Document found for ID prefix: ${documentName}`);
        }
      }

      console.log(`Successfully stored document: ${documentName}`);
    } catch (error) {
      console.error(`Failed to store document ${documentName}:`, error);
      throw error;
    }
  },
});
