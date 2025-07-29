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
  pinned?: boolean;
};
