import type { User } from "../authorization";
import type { Convo, Message } from "../messages";

export interface IDao {
  getUser(username: string): Promise<User>;
  addUser(user: User): Promise<void>;
  createToken(username: string): Promise<string>;
  verifyToken(token: string): Promise<string>;
  deleteToken(token: string): Promise<void>;
  getUserFromToken(token: string): Promise<User>;
  getUsernames(searchTerm: string): Promise<string[]>;
  createConvo(users: string[]): Promise<string>;
  getUserConvos(
    username: string,
    dateRange: [number, number],
  ): Promise<Convo[]>;
  getUsersInConvo(convoId: string, user: User): Promise<string[]>;
  addMessage(convoId: string, message: Message, user: User): Promise<void>;
  getMessages(
    convoId: string,
    dateRange: [number, number],
    user: User,
  ): Promise<Message[]>;
}
