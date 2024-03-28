import { WebSocketServer } from "ws";

export const messageWSS = new WebSocketServer({ noServer: true });

messageWSS.on("connection", (ws) => {
  ws.on("message", (data) => {
    ws.send(data);
  });
});
