import { WebSocketServer, WebSocket, RawData } from "ws";
import { UnauthorizedError, User } from "../authorization";
import { UserDao } from "../dao";
import { WebSocketHandler } from "../websocket";
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
        if (this.ws) this.ws.close();
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

  async tokenMsg(message: TokenMSG) {
    const token = WebSocketHandler.getInstance().getToken(message.token);
    this.user = await UserDao.getInstance().getUserFromToken(token);
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
    const data = rawData.toString();

    const wsMessage: WSMessage = JSON.parse(data);

    switch (wsMessage.type) {
      case "convo":
        await this.convoMsg(wsMessage);
        break;
      case "token":
        await this.tokenMsg(wsMessage);
        break;
      case "message":
        await this.messageMsg(wsMessage);
        break;
    }

    if (!this.user) throw new UnauthorizedError();
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

messageWSS.on("connection", (ws) => {
  const wsMessageHandler = new WSMessageHandler();

  wsMessageHandler.onConnection(ws);
});
