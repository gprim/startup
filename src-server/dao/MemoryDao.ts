import {
  BadRequestError,
  UnauthorizedError,
  type User,
} from "../authorization";
import type { Message } from "../messages";
import type { IDao } from "./DaoTypes";
import * as crypto from "node:crypto";

export class MemoryDao implements IDao {
  // username -> user
  private users: Record<string, User> = {};
  // all usernames
  private usernames: Set<string> = new Set();

  // token -> username
  private tokens: Record<string, string> = {};

  // username -> { convoId -> lastMessage }
  private convos: Record<string, Record<string, number>> = {};
  // convoId -> username[]
  private usersInConvo: Record<string, string[]> = {};

  // convoId -> Message[]
  private messages: Record<string, Message[]> = {};

  async getUser(username: string) {
    return this.users[username];
  }

  async addUser(user: User) {
    if (this.users[user.username])
      throw new BadRequestError("User already exists");

    this.users[user.username] = user;
    this.usernames.add(user.username);
  }

  async createToken(username: string) {
    const token = crypto.randomUUID();

    this.tokens[token] = username;

    return token;
  }

  async verifyToken(token: string) {
    return this.tokens[token];
  }

  async deleteToken(token: string) {
    if (this.tokens[token]) delete this.tokens[token];
  }

  async getUserFromToken(token: string) {
    if (!this.tokens[token]) throw new UnauthorizedError();
    return this.users[this.tokens[token]];
  }

  async getUsernames(searchTerm: string) {
    const usernames: string[] = [];

    for (const username of this.usernames.values()) {
      if (username.includes(searchTerm)) usernames.push(username);
    }

    return usernames;
  }

  async createConvo(users: string[]) {
    const convoId = crypto.randomUUID();

    for (const user of users) {
      if (!this.convos[user]) this.convos[user] = {};
      this.convos[user][convoId] = Date.now();
    }

    this.usersInConvo[convoId] = users;

    return convoId;
  }

  async getUserConvos(username: string, [before, after]: [number, number]) {
    const convos = this.convos[username];

    if (!convos) return [];

    return Object.keys(convos)
      .filter(
        (convoId) => convos[convoId] >= before && convos[convoId] <= after,
      )
      .map((convoId) => ({ convoId, users: this.usersInConvo[convoId] }));
  }

  private authorizeUserConvo(convoId: string, user: User) {
    if (
      !this.usersInConvo[convoId] ||
      !this.usersInConvo[convoId].includes(user.username)
    )
      throw new UnauthorizedError();
  }

  async getUsersInConvo(convoId: string, user: User) {
    this.authorizeUserConvo(convoId, user);

    return this.usersInConvo[convoId];
  }

  async addMessage(convoId: string, message: Message, user: User) {
    this.authorizeUserConvo(convoId, user);

    if (!this.messages[convoId]) this.messages[convoId] = [];

    this.convos[user.username][convoId] = message.timestamp;

    this.messages[convoId].push(message);
  }

  async getMessages(
    convoId: string,
    [before, after]: [number, number],
    user: User,
  ) {
    this.authorizeUserConvo(convoId, user);

    if (!this.messages[convoId]) return [];

    const messagesToReturn: Message[] = [];

    for (const message of this.messages[convoId]) {
      if (message.timestamp <= before) continue;
      if (message.timestamp >= after) break;

      messagesToReturn.push(message);
    }

    return messagesToReturn;
  }
}
