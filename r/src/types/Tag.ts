export type Tag = {
  id: string;
  name: string;
  description?: string;
  count: number;
};

export type CreateTagInput = {
  name: string;
  description?: string;
};
