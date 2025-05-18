import { WebSocketServer, WebSocket } from "ws";
import { handleMessage } from "../handlers";

export const clients = new Map<string, WebSocket>();
let clientIdCounter = 0;

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });
  console.log(`WebSocket server started on ws://localhost:${port}`);

  wss.on("connection", (ws) => {
    const clientId = (clientIdCounter++).toString();
    clients.set(clientId, ws);
    console.log("New client connected");

    ws.on("message", (message: string) => {
      console.log(`Received message from ${clientId}: ${message}`);
      handleMessage(ws, message, clientId);
    });

    ws.on("close", () => {
      console.log(`Client disconnected: ${clientId}`);
      clients.delete(clientId);
    });
  });
}
