import express from 'express';

import {
  addCollaborator,
  approveRequest,
  createDoc,
  deleteDoc,
  getCollaborators,
  getDoc,
  getDocByShareId,
  getDocs,
  getRequests,
  rejectRequest,
  removeCollaborator,
  updateDoc,
  updateDocSettings,
} from '@/controllers/document.controller';
import { authenticate } from '@/middlewares/auth.middleware';

export const docRouter = express.Router();

docRouter.use(authenticate);
// test this
docRouter.get('/share/:shareId', getDocByShareId); // used to get the share id for the document

docRouter.post('/', createDoc);
docRouter.get('/', getDocs);
docRouter.get('/:id', getDoc);
docRouter.put('/:id', updateDoc);
docRouter.delete('/:id', deleteDoc);

// test these
docRouter.patch('/:id/settings', updateDocSettings); // Used to toggle allowSelfJoin for the document // !Owner only access

docRouter.get('/:id/collaborators', getCollaborators); // returns list
docRouter.post('/:id/collaborators', addCollaborator); // adds a new one //!Owner only access
docRouter.delete('/:id/collaborators/:userId', removeCollaborator); // optional

docRouter.get('/:id/requests', getRequests); // !Owner only access
docRouter.post('/:id/requests/:requestId/approve', approveRequest);
docRouter.delete('/:id/requests/:requestId/reject', rejectRequest);
