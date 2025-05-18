import { WebSocket } from "ws";
import { WSMessage } from "../types";
import { handleRegistration } from "./playerHandler";
import { handleCreateRoom } from "./roomHandler";

function messageHandler(ws: WebSocket, message: string, clientId: string) {
  try {
    const msg: WSMessage = JSON.parse(message);
    const { type, data } = msg;
    switch (type) {
      case "reg":
        handleRegistration(ws, data, clientId);
        break;

      case "create_room":
        handleCreateRoom(clientId);
        break;

      default:
        console.warn("Unknown message type:");
    }
  } catch (error) {
    console.warn(error);
  }
}

export { messageHandler };
