import { WSMessage } from "../types";
import { WebSocket } from "ws";

const sendMessage = (ws: WebSocket, message: WSMessage) => {
  console.log("sendMessage", message);
  ws.send(JSON.stringify({ ...message, data: JSON.stringify(message.data) }));
};

export { sendMessage };
