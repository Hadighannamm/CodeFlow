import type { UserProfile } from "./UserProfile";

export type Answer = {
  id: string;
  body: string;
  questionId: string;
  author: UserProfile;
  authorId: string;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnswerInput = {
  body: string;
  questionId: string;
};

export type UpdateAnswerInput = {
  body?: string;
};
