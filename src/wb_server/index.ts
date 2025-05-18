import { WebSocketServer, WebSocket } from "ws";

// Хранилище всех подключенных клиентов
const clients = new Set<WebSocket>();

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  console.log(`WebSocket server started on ws://localhost:${port}`);

  wss.on("connection", (ws) => {
    console.log("New client connected");
    clients.add(ws);

    ws.on("message", (message) => {
      console.log(`Received: ${message}`);

      ws.send(`Server received: ${message}`);
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      clients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  wss.on("close", () => {
    console.log("WebSocket server closed");
  });
}
