export type UserProfile = {
  id: string;
  username: string;
  email: string;
  reputation: number;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  username: string;
};
