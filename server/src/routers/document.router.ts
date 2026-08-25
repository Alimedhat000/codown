import express from 'express';

import {
  addCollaborator,
  approveRequest,
  createDoc,
  deleteDoc,
  getCollaborators,
  getDoc,
  getDocByToken,
  getDocs,
  getRequests,
  getShareLink,
  rejectRequest,
  removeCollaborator,
  updateDoc,
  updateDocSettings,
} from '@/controllers/document.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validation.middleware';
import { AddCollaboratorSchema } from '@/validations/addCollaborator.schema';
import { CreateDocumentSchema } from '@/validations/createDocument.schema';
import {
  CollaboratorParamsSchema,
  IdParamsSchema,
  RequestIdParamsSchema,
  ShareLinkQuerySchema,
} from '@/validations/documentParams.schema';
import { UpdateDocSettingsSchema } from '@/validations/updateDocSettings.schema';
import { UpdateDocumentSchema } from '@/validations/updateDocument.schema';

export const docRouter = express.Router();

docRouter.use(authenticate);
docRouter.get('/share/:token', getDocByToken);

docRouter.post('/', validate({ body: CreateDocumentSchema }), createDoc);
docRouter.get('/', getDocs);
docRouter.get('/:id', validate({ params: IdParamsSchema }), getDoc);
docRouter.put('/:id', validate({ params: IdParamsSchema, body: UpdateDocumentSchema }), updateDoc);
docRouter.delete('/:id', validate({ params: IdParamsSchema }), deleteDoc);

docRouter.patch(
  '/:id/settings',
  validate({ params: IdParamsSchema, body: UpdateDocSettingsSchema }),
  updateDocSettings
); // Used to toggle allowSelfJoin for the document // !Owner only access

docRouter.get('/:id/share-link', validate({ params: IdParamsSchema, query: ShareLinkQuerySchema }), getShareLink); // get the document share link with the share token

docRouter.get('/:id/collaborators', validate({ params: IdParamsSchema }), getCollaborators); // returns list
docRouter.post(
  '/:id/collaborators',
  validate({ params: IdParamsSchema, body: AddCollaboratorSchema }),
  addCollaborator
); // adds a new one by email //!Owner only access
docRouter.delete('/:id/collaborators/:userId', validate({ params: CollaboratorParamsSchema }), removeCollaborator); // optional

docRouter.get('/:id/requests', validate({ params: IdParamsSchema }), getRequests); // !Owner only access
docRouter.post('/:id/requests/:requestId/approve', validate({ params: RequestIdParamsSchema }), approveRequest);
docRouter.delete('/:id/requests/:requestId/reject', validate({ params: RequestIdParamsSchema }), rejectRequest);
