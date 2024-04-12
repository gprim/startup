export type Message = {
  text: string;
  from: string;
  timestamp: number;
};

export type Convo = {
  convoId: string;
  users: string[];
};
