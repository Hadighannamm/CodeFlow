export type Poll = {
  id: string;
  questionId: string;
  options: PollOption[];
  createdAt: string;
  updatedAt: string;
};

export type PollOption = {
  id: string;
  pollId: string;
  text: string;
  votes: number;
};

export type PollVote = {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: string;
};
