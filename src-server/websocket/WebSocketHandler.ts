import { WebSocketServer } from "ws";
import { IncomingMessage, Server } from "http";
import * as stream from "node:stream";
import { UserDao } from "../dao";

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

  async upgrade(req: IncomingMessage, socket: stream.Duplex, head: Buffer) {
    if (!req.url || !this.servers[req.url]) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const cookies = req.headers.cookie
      .split("; ")
      .reduce<Record<string, string>>((cookies, current) => {
        const [name, cookie] = current.split("=");
        cookies[name] = cookie;
        return cookies;
      }, {});

    if (
      !cookies.authorization ||
      !(await UserDao.getInstance().verifyToken(cookies.authorization))
    ) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const server = this.servers[req.url];

    server.handleUpgrade(req, socket, head, (ws) => {
      server.emit("connection", ws, req);
    });
  }
}
