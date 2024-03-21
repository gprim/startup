import type { User } from "../authorization";
import type { Message } from "../messages";
import type {
  Convo,
  ConvoSearch,
  IDao,
  MessageAdd,
  MessageSearch,
  TokenPair,
} from "./DaoTypes";
import * as crypto from "node:crypto";

type DaosParams = {
  usersDao: IDao<User>;
  tokensDao: IDao<TokenPair>;
  messageDao: IDao<MessageAdd, MessageSearch, Message>;
  convoDao: IDao<string[], ConvoSearch, Convo>;
};

export class UsersDao {
  usersDao: IDao<User>;
  tokensDao: IDao<TokenPair>;
  messageDao: IDao<MessageAdd, MessageSearch, Message>;
  convoDao: IDao<string[], ConvoSearch, Convo>;
  private static _instance: UsersDao;

  private constructor({
    usersDao,
    tokensDao,
    messageDao,
    convoDao,
  }: DaosParams) {
    this.usersDao = usersDao;
    this.tokensDao = tokensDao;
    this.messageDao = messageDao;
    this.convoDao = convoDao;
  }

  public static initialize(params: DaosParams) {
    const usersDao = new UsersDao(params);

    this._instance = usersDao;

    return usersDao;
  }

  public static getInstance() {
    if (!this._instance) throw new Error("Dao hasn't been initialized!");
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

    return token;
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

  async createConvo(users: string[]) {
    const { convoId } = await this.convoDao.addItem(users);

    return convoId;
  }

  async getConvos(search: ConvoSearch) {
    const convos = await this.convoDao.getItems(search);

    return convos;
  }

  async addMessage(messageAdd: MessageAdd, user: User) {
    const [convo] = await this.convoDao.getItems({
      convoId: messageAdd.convoId,
    });

    if (!convo.users.includes(user.username)) throw new Error("Unauthorized");

    await this.convoDao.getItem({
      convoId: messageAdd.convoId,
      username: user.username,
    });

    await this.messageDao.addItem(messageAdd);
  }

  async getMessages(messageSearch: MessageSearch, user: User) {
    const [convo] = await this.convoDao.getItems({
      convoId: messageSearch.convoId,
    });

    if (!convo.users.includes(user.username)) throw new Error("Unauthorized");

    const messages = await this.messageDao.getItems(messageSearch);

    return messages;
  }
}
