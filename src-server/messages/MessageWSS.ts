import { WebSocketServer, WebSocket, RawData } from "ws";
import { UnauthorizedError, User } from "../authorization";
import { UserDao } from "../dao";
import { WebSocketHandler } from "../websocket";

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
  private ws: WebSocket;
  private user: User;
  private convoId: string;

  errorHandlerWS(func: (rawData: RawData) => Promise<void>) {
    return async (rawData: RawData) => {
      try {
        await func(rawData);
      } catch (err) {
        console.log(err);
        this.ws.close();
      }
    };
  }

  async convoMsg(message: ConvoMSG) {
    this.convoId = message.convoId;

    // will authenticate automatically
    await UserDao.getInstance().getUsersInConvo(this.convoId, this.user);
  }

  async tokenMsg(message: TokenMSG) {
    this.user = await UserDao.getInstance().getUserFromToken(
      WebSocketHandler.getInstance().getToken(message.token),
    );
  }

  async messageMsg(message: MessageMSG) {
    await UserDao.getInstance().addMessage(
      this.convoId,
      {
        text: message.message,
        from: this.user.username,
        timestamp: Date.now(),
      },
      this.user,
    );
  }

  async onMessage(rawData: RawData) {
    const data = rawData.toString();

    const wsMessage: WSMessage = JSON.parse(data);

    switch (wsMessage.type) {
      case "convo":
        this.convoMsg(wsMessage);
        break;
      case "token":
        this.tokenMsg(wsMessage);
        break;
      case "message":
        this.messageMsg(wsMessage);
        break;
    }

    if (!this.user) throw new UnauthorizedError();
  }

  async onConnection(ws: WebSocket) {
    const erhdlr = this.errorHandlerWS;

    ws.on("message", erhdlr(this.onMessage));
  }
}

messageWSS.on("connection", (ws) => {
  const wsMessageHandler = new WSMessageHandler();

  wsMessageHandler.onConnection(ws);
});
