import type { User } from "./AuthTypes";
import * as crypto from "node:crypto";

export class Users {
  private users: Record<string, User> = {};
  private tokens: Record<string, string> = {};
  private usernames: string[] = [];
  private static _instance: Users;
  constructor() {}

  static getInstance() {
    if (!this._instance) this._instance = new Users();
    return this._instance;
  }

  getUser(username: string) {
    return this.users[username];
  }

  addUser(user: User) {
    this.usernames.push(user.username);
    this.users[user.username] = user;
  }

  createToken(username: string) {
    const token = crypto.randomUUID();
    this.tokens[token] = username;
    return token;
  }

  verifyToken(token: string) {
    if (this.tokens[token]) return true;
    return false;
  }

  deleteToken(token: string) {
    if (this.tokens[token]) delete this.tokens[token];
  }

  getUserFromToken(token: string) {
    if (!this.tokens[token]) throw new Error("Unauthorized");
    if (!this.users[this.tokens[token]]) throw new Error("Bad user");
    return this.users[this.tokens[token]];
  }

  getUsernames(searchTerm: string) {
    return this.usernames.filter((username) => username.includes(searchTerm));
  }
}
