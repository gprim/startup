import type { User } from "../../authorization";
import type { IDao } from "../DaoTypes";

export class UsersMemoryDao implements IDao<User> {
  private users: Record<string, User> = {};
  private usernames: Set<string> = new Set();

  async getItem(user: Partial<User>): Promise<User> {
    const username = user.username;

    return this.users[username];
  }
  async getItems(user: Partial<User>) {
    const username = user.username;

    const usernames = this.usernames.values();

    return Array.from(usernames)
      .filter((usrnm) => usrnm.includes(username))
      .map((usrnm) => this.users[usrnm]);
  }
  async addItem(user: User) {
    if (await this.getItem(user)) throw new Error("User already exists");

    this.users[user.username] = user;
    this.usernames.add(user.username);

    return user;
  }
  async deleteItem(user: Partial<User>) {
    if (this.users[user.username]) delete this.users[user.username];

    this.usernames.delete(user.username);
  }
}
