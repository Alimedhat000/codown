export type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
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
