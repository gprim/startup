import { Collection, Db, MongoClient, WithId } from "mongodb";
import { BadRequestError, User } from "../authorization";
import { Convo, Message } from "../messages";
import { IDao } from "./DaoTypes";
import * as crypto from "node:crypto";

type TokenPair = {
  token: string;
  username: string;
};

type ConvoInfo = {
  username: string;
  convos: Record<string, number>;
};

type ConvoUsers = {
  convoId: string;
  users: string[];
};

type ConvoMessages = {
  convoId: string;
  messages: Message[];
};

export class MongoDao implements IDao {
  private url: string;
  private db: Db;
  private client: MongoClient;

  private users: Collection<User>;
  private tokens: Collection<TokenPair>;
  private convos: Collection<ConvoInfo>;
  private usersInConvo: Collection<ConvoUsers>;
  private messages: Collection<ConvoMessages>;

  private static _instance: MongoDao;

  constructor(username: string, password: string, hostname: string) {
    this.url = `mongodb+srv://${username}:${password}@${hostname}`;
    this.client = new MongoClient(this.url);
  }

  private async connect() {
    await this.client.connect();
    this.db = this.client.db("startup");
    await this.db.command({ ping: 1 });
    this.users = this.db.collection("users");
    this.users.createIndex({ username: 1 }, { unique: true });

    this.tokens = this.db.collection("tokens");
    this.users.createIndex({ token: 1 }, { unique: true });

    this.convos = this.db.collection("convos");
    this.convos.createIndex({ username: 1 }, { unique: true });

    this.usersInConvo = this.db.collection("users-in-convo");
    this.usersInConvo.createIndex({ convoId: 1 }, { unique: true });

    this.messages = this.db.collection("messages");
    this.messages.createIndex({ convoId: 1 }, { unique: true });
  }

  public static async initialize(
    username: string,
    password: string,
    hostname: string,
  ) {
    if (this._instance) return this._instance;

    this._instance = new MongoDao(username, password, hostname);
    await this._instance.connect();

    return this._instance;
  }

  private removeId<T>(value: WithId<T>): T {
    delete value._id;
    return value as T;
  }

  async getUser(username: string): Promise<User> {
    const user = await this.users.findOne({ username });
    if (!user) return undefined;
    return this.removeId(user);
  }

  async addUser(user: User): Promise<void> {
    if (await this.getUser(user.username))
      throw new BadRequestError("User already exists");

    await this.users.insertOne(user);
  }
  async createToken(username: string): Promise<string> {
    const token = crypto.randomUUID();

    await this.tokens.insertOne({ token, username });

    return token;
  }
  async verifyToken(token: string): Promise<string> {
    const tokenPair = await this.tokens.findOne({ token });
    return tokenPair?.username;
  }
  async deleteToken(token: string): Promise<void> {
    await this.tokens.deleteOne({ token });
  }
  async getUserFromToken(token: string): Promise<User> {
    throw new Error("Method not implemented.");
  }
  async getUsernames(searchTerm: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  async createConvo(users: string[]): Promise<string> {
    throw new Error("Method not implemented.");
  }
  async getUserConvos(
    username: string,
    dateRange: [number, number],
  ): Promise<Convo[]> {
    throw new Error("Method not implemented.");
  }
  async getUsersInConvo(convoId: string, user: User): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
  async addMessage(
    convoId: string,
    message: Message,
    user: User,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async getMessages(
    convoId: string,
    dateRange: [number, number],
    user: User,
  ): Promise<Message[]> {
    throw new Error("Method not implemented.");
  }
}
