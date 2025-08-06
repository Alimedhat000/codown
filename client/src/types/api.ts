export type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  fullName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Document = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
};

export type CreateDocumentForm = {
  title: string;
};

export type DocumentData = {
  id?: string;
  title: string;
  content: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  versionCount?: string;
};

export interface Collaborator {
  id: string;
  documentId: string;
  userId: string;
  permission: 'view' | 'edit';
  user: User;
}

export type CollaborationRequest = {
  id: string;
  userId: string;
  documentId: string;
  status: 'pending' | 'approved' | 'rejected';
  permission: 'view' | 'edit';
  createdAt: string;
  user: User;
};
