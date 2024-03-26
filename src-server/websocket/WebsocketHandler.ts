import { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import * as stream from "node:stream";

export class WebSocketHandler {
  private wss: WebSocketServer;
  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
  }

  upgrade(req: IncomingMessage, socket: stream.Duplex, head: Buffer) {
    this.wss.handleUpgrade(req, socket, head, (ws) => {
      this.wss.emit("connection", ws, req);
    });
  }
}
