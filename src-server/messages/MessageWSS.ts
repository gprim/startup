import { WebSocketServer, WebSocket, RawData } from "ws";
import { UnauthorizedError, User } from "../authorization";
import { UserDao } from "../dao";
import { Message } from "./MessageTypes";

type ConvoMSG = {
  type: "convo";
  convoId: string;
};

type TokenMSG = {
  type: "token";
  token: string;
};

type MessageMSG = {
  type: "message";
  message: string;
};

type WSMessage = ConvoMSG | TokenMSG | MessageMSG;

export const messageWSS = new WebSocketServer({ noServer: true });

class WSMessageHandler {
  // convoId -> { username -> WS }
  private static activeConvos: Record<string, Record<string, WebSocket>> = {};

  private static addConvo(convoId: string, user: User, ws: WebSocket) {
    if (!this.activeConvos[convoId]) this.activeConvos[convoId] = {};
    this.activeConvos[convoId][user.username] = ws;
  }

  private static removeConvo(convoId: string, user: User) {
    if (
      !this.activeConvos[convoId] ||
      !user ||
      !this.activeConvos[convoId][user.username]
    )
      return;

    delete this.activeConvos[convoId][user.username];

    if (!Object.keys(this.activeConvos[convoId]).length)
      delete this.activeConvos[convoId];
  }

  private static sendMessage(convoId: string, user: User, message: Message) {
    if (!this.activeConvos[convoId]) return;

    for (const username of Object.keys(this.activeConvos[convoId])) {
      if (username === user.username) continue;

      const ws = this.activeConvos[convoId][username];

      ws.send(JSON.stringify(message));
    }
  }

  constructor(user: User) {
    this.user = user;
  }

  private ws: WebSocket;
  private user: User;
  private convoId: string;

  errorHandlerWS(func: (rawData: RawData) => Promise<void>) {
    return async (rawData: RawData) => {
      try {
        await func(rawData);
      } catch (err) {
        console.log(err);
        WSMessageHandler.removeConvo(this.convoId, this.user);
        if (this.ws) {
          this.ws.send(
            JSON.stringify({
              type: "error",
              error: err?.message,
              stack: err?.stack,
            }),
          );
          this.ws.close();
        }
      }
    };
  }

  async convoMsg(message: ConvoMSG) {
    if (this.convoId) {
      WSMessageHandler.removeConvo(this.convoId, this.user);
    }

    this.convoId = message.convoId;

    // will authenticate automatically
    await UserDao.getInstance().getUsersInConvo(this.convoId, this.user);

    WSMessageHandler.addConvo(this.convoId, this.user, this.ws);
  }

  async messageMsg(message: MessageMSG) {
    const userMessage: Message = {
      text: message.message,
      from: this.user.username,
      timestamp: Date.now(),
    };

    await UserDao.getInstance().addMessage(
      this.convoId,
      userMessage,
      this.user,
    );

    WSMessageHandler.sendMessage(this.convoId, this.user, userMessage);
  }

  async onMessage(rawData: RawData) {
    if (!this.user) throw new UnauthorizedError();

    const data = rawData.toString();

    const wsMessage: WSMessage = JSON.parse(data);

    switch (wsMessage.type) {
      case "convo":
        await this.convoMsg(wsMessage);
        break;
      case "message":
        await this.messageMsg(wsMessage);
        break;
    }
  }

  async onClose() {
    if (!this.convoId || !this.user) return;

    WSMessageHandler.removeConvo(this.convoId, this.user);
  }

  async onConnection(ws: WebSocket) {
    const handlers: [string, (rawData: RawData) => Promise<void>][] = [
      ["message", this.onMessage],
      ["close", this.onClose],
    ];

    for (const [name, handler] of handlers) {
      ws.on(name, this.errorHandlerWS(handler.bind(this)).bind(this));
    }
    this.ws = ws;
  }
}

messageWSS.on("connection", async (ws, req) => {
  try {
    const cookies = req?.headers?.cookie
      ?.split("; ")
      .reduce<Record<string, string>>((cookies, current) => {
        const [name, cookie] = current.split("=");
        cookies[name] = cookie;
        return cookies;
      }, {});

    const token = cookies?.authorization;

    if (!token) return;

    const user = await UserDao.getInstance().getUserFromToken(token);

    const wsMessageHandler = new WSMessageHandler(user);

    wsMessageHandler.onConnection(ws);
  } catch (err) {
    if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) return;
    ws.send(
      JSON.stringify({ type: "error", error: err?.message, stack: err?.stack }),
    );
  }
});
