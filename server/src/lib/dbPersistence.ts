import { Database } from '@hocuspocus/extension-database';
import * as Y from 'yjs';

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
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
      const id = await slugIDtoFullID(documentName);
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
        await prisma.yjsDocumentState.update({
          where: { documentId: id },
          data: {
            state: Buffer.from(state),
            version: { increment: 1 },
          },
        });

        await prisma.document.update({
          where: { id: id },
          data: { content: plainText },
        });
      } else {
        const documentExists = await prisma.document.findFirst({
          where: { id: id },
        });

        if (documentExists) {
          await prisma.yjsDocumentState.create({
            data: {
              documentId: documentExists.id,
              state: Buffer.from(state),
            },
          });

          await prisma.document.update({
            where: { id: documentExists.id },
            data: { content: plainText },
          });
        } else {
          logger.warn(`No Document found for ID prefix: ${documentName}`, {
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
