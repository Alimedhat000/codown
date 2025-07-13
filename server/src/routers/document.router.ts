import express from 'express';

import { createDoc, deleteDoc, getDoc, getDocs, updateDoc } from '@/controllers/document.controller';
import { authenticate } from '@/middlewares/auth.middleware';

export const docRouter = express.Router();

docRouter.use(authenticate);

docRouter.post('/', createDoc);
docRouter.get('/', getDocs);
docRouter.get('/:id', getDoc);
docRouter.put('/:id', updateDoc);
docRouter.delete('/:id', deleteDoc);
