import type { UserProfile } from "./UserProfile";

export type Answer = {
  id: string;
  body: string;
  questionId: string;
  userId: string;
  author: UserProfile;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnswerInput = {
  body: string;
  questionId: string;
  userId: string;
};

export type UpdateAnswerInput = {
  body?: string;
};
