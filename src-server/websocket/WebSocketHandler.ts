import { WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";
import * as stream from "node:stream";

export class WebSocketHandler {
  private static _instance: WebSocketHandler;

  private servers: Record<string, WebSocketServer> = {};

  private constructor() {}

  static getInstance() {
    if (!this._instance) this._instance = new WebSocketHandler();

    return this._instance;
  }

  bindHttpServer(httpServer: Server) {
    httpServer.on("upgrade", this.upgrade.bind(this));
  }

  registerWSServer(path: string, websocketServer: WebSocketServer) {
    this.servers[path] = websocketServer;
  }

  upgrade(req: IncomingMessage, socket: stream.Duplex, head: Buffer) {
    if (!req.url || !this.servers[req.url]) return;
    const server = this.servers[req.url];

    server.handleUpgrade(req, socket, head, (ws) => {
      server.emit("connection", ws, req);
    });
  }
}
