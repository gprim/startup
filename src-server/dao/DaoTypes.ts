import type { Message } from "../messages";

export interface IDao<T, K = Partial<T>, S = T> {
  getItems(item: K): Promise<S[]>;
  getItem(item: K): Promise<S>;
  addItem(item: T): Promise<S>;
  deleteItem(item: K): Promise<void>;
}

export type TokenPair = {
  token: string;
  username: string;
};

export type ConvoSearch = {
  username: string;
  daterange: [number, number];
};

export type MessageAdd = {
  convoId: string;
  message: Message;
};

export type MessageSearch = {
  convoId: string;
  dateRange: [number, number];
};
