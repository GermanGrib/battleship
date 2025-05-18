import { WebSocketServer, WebSocket } from "ws";
import { handleMessage } from "../handlers";

export const clients = new Set<WebSocket>();

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  console.log(`WebSocket server started on ws://localhost:${port}`);

  wss.on("connection", (ws) => {
    console.log("New client connected");
    clients.add(ws);

    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        if (typeof parsedMessage.data === "string") {
          parsedMessage.data = JSON.parse(parsedMessage.data);
        }

        const response = handleMessage(ws, parsedMessage);

        if (response) {
          console.log("Sending response:", response);
          ws.send(JSON.stringify(response));
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
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
