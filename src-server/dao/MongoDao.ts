import { Collection, Db, Filter, MongoClient, WithId } from "mongodb";
import { BadRequestError, UnauthorizedError, User } from "../authorization";
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
  private usersInConvo: Collection<Convo>;
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
    this.tokens.createIndex({ token: 1 }, { unique: true });

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
    const username = await this.verifyToken(token);
    if (!username) return undefined;
    const user = await this.getUser(username);
    return user;
  }
  async getUsernames(searchTerm: string): Promise<string[]> {
    // search for usernames w/ regex
    const query: Filter<User> = {
      username: { $regex: searchTerm, $options: "i" },
    };

    // only return username field
    const projection = { username: 1, _id: 0 };

    const partialUsers = await this.users
      .find(query)
      .project<Partial<User>>(projection)
      .toArray();

    return partialUsers.map((user) => user.username);
  }

  async createConvo(users: string[]): Promise<string> {
    const convoId = crypto.randomUUID();

    await this.usersInConvo.insertOne({ convoId, users });

    const now = Date.now();

    for (const username of users) {
      await this.convos.updateOne(
        { username },
        { $set: { [`convos.${convoId}`]: now } },
        { upsert: true },
      );
    }

    return convoId;
  }
  async getUserConvos(
    username: string,
    [before, after]: [number, number],
  ): Promise<Convo[]> {
    const userConvos = await this.convos.findOne({ username });

    if (!userConvos) return [];

    const convoIds = Object.keys(userConvos.convos).filter(
      (convoId) =>
        userConvos.convos[convoId] >= before &&
        userConvos.convos[convoId] <= after,
    );

    const cursor = this.usersInConvo.find({ convoId: { $in: convoIds } });

    const convos: Convo[] = [];

    for await (const convo of cursor) {
      convos.push(this.removeId(convo));
    }

    return convos;
  }
  async getUsersInConvo(convoId: string, user: User): Promise<string[]> {
    const convo = await this.usersInConvo.findOne({ convoId });

    if (!convo || !convo.users.includes(user.username))
      throw new UnauthorizedError();

    return convo.users;
  }
  async addMessage(
    convoId: string,
    message: Message,
    user: User,
  ): Promise<void> {
    // this will automatically check if user is in convo
    // and will err out if not
    await this.getUsersInConvo(convoId, user);

    const convo = await this.messages.findOne({ convoId });

    if (!convo) await this.messages.insertOne({ convoId, messages: [message] });
    else
      await this.messages.updateOne(
        { convoId },
        { $push: { messages: message } },
      );
  }
  async getMessages(
    convoId: string,
    [before, after]: [number, number],
    user: User,
  ): Promise<Message[]> {
    // this will automatically check if user is in convo
    // and will err out if not
    await this.getUsersInConvo(convoId, user);

    const convo = await this.messages.findOne({ convoId });

    if (!convo) return undefined;

    const messages = [];

    for (const message of convo.messages) {
      if (message.timestamp <= before) continue;
      if (message.timestamp >= after) break;

      messages.push(message);
    }

    return messages;
  }
}
