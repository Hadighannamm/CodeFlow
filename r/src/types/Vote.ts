export type Vote = {
  id: string;
  userId: string;
  targetId: string; // questionId or answerId
  targetType: 'question' | 'answer';
  voteType: 1 | -1; // 1 for upvote, -1 for downvote
  createdAt: string;
};

export type VoteInput = {
  targetId: string;
  targetType: 'question' | 'answer';
  voteType: 1 | -1;
};
