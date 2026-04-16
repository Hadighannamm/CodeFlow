import type { UserProfile } from "./UserProfile";
import type { Tag } from "./Tag";
import type { Poll } from "./Poll";

export type Question = {
  id: string;
  title: string;
  body: string;
  tags: Tag[];
  author: UserProfile;
  authorId: string;
  votes: number;
  answerCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  poll?: Poll;
};

export type CreateQuestionInput = {
  title: string;
  body: string;
  tags: string[];
  pollOptions?: string[];
};

export type UpdateQuestionInput = {
  title?: string;
  body?: string;
  tags?: string[];
};
