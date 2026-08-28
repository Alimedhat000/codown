import { Database } from '@hocuspocus/extension-database';
import * as Y from 'yjs';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const dbPersistence = new Database({
  fetch: async ({ documentName }) => {
    try {
      const id = documentName;
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
      logger.error(`Failed to fetch document ${documentName}`, {
        action: 'DB_FETCH',
        documentName,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },

  store: async ({ documentName, state }) => {
    try {
      const id = documentName;
      const existing = await prisma.yjsDocumentState.findUnique({
        where: { documentId: id },
      });

      const ydoc = new Y.Doc();
      Y.applyUpdate(ydoc, state);
      const plainText = ydoc.getText('content').toString();
      logger.debug(`Storing document: ${documentName}, ID: ${id}, Content Length: ${plainText.length}`, {
        action: 'DB_STORE',
      });

      if (existing) {
        // Snapshot and its plaintext mirror must stay consistent: write both atomically.
        await prisma.$transaction([
          prisma.yjsDocumentState.update({
            where: { documentId: id },
            data: {
              state: Buffer.from(state),
              version: { increment: 1 },
            },
          }),
          prisma.document.update({
            where: { id: id },
            data: { content: plainText },
          }),
        ]);
      } else {
        const documentExists = await prisma.document.findFirst({
          where: { id: id },
        });

        if (documentExists) {
          await prisma.$transaction([
            prisma.yjsDocumentState.create({
              data: {
                documentId: documentExists.id,
                state: Buffer.from(state),
              },
            }),
            prisma.document.update({
              where: { id: documentExists.id },
              data: { content: plainText },
            }),
          ]);
        } else {
          logger.warn(`No Document found for ID: ${documentName}`, {
            action: 'DB_STORE_DOC_NOT_FOUND',
          });
        }
      }

      logger.debug(`Successfully stored document: ${documentName}`, {
        action: 'DB_STORE_SUCCESS',
      });
    } catch (error) {
      logger.error(`Failed to store document ${documentName}`, {
        action: 'DB_STORE_ERROR',
        documentName,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
});
