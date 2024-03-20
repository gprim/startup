import type { User } from "../authorization";
import type { IDao, TokenPair } from "./DaoTypes";
import * as crypto from "node:crypto";

export class UsersDao {
  usersDao: IDao<User>;
  tokensDao: IDao<TokenPair>;
  private static _instance: UsersDao;

  constructor(usersDao?: IDao<User>, tokensDao?: IDao<TokenPair>) {
    UsersDao._instance = this;
    this.usersDao = usersDao;
    this.tokensDao = tokensDao;
  }

  public static getInstance() {
    if (!this._instance) this._instance = new UsersDao();
    return this._instance;
  }

  async getUser(username: string) {
    return await this.usersDao.getItem({ username });
  }

  async addUser(user: User) {
    await this.usersDao.addItem(user);
  }

  async createToken(username: string) {
    const token = crypto.randomUUID();

    await this.tokensDao.addItem({ token, username });
  }

  async verifyToken(token: string) {
    return Boolean(await this.tokensDao.getItem({ token }));
  }

  async deleteToken(token: string) {
    await this.tokensDao.deleteItem({ token });
  }

  async getUserFromToken(token: string) {
    const username = (await this.tokensDao.getItem({ token }))?.username;

    if (!username) throw new Error("Unauthorized");

    const user = await this.usersDao.getItem({ username });

    if (!user) throw new Error("Bad user");

    return user;
  }

  async getUsernames(searchTerm: string) {
    return (await this.usersDao.getItems({ username: searchTerm })).map(
      (user) => user.username,
    );
  }
}
