import { WSMessage } from "../types";
import { WebSocket } from "ws";
import { players } from "../entities/player";

const sendMessage = (ws: WebSocket, message: WSMessage) => {
  console.log("sendMessage", message);
  ws.send(JSON.stringify({ ...message, data: JSON.stringify(message.data) }));
};

const broadcastMessage = (message: WSMessage) => {
  for (const player of players.values()) {
    console.log("broadcastMessage", message, player.name);
    player.ws?.send(
      JSON.stringify({ ...message, data: JSON.stringify(message.data) }),
    );
  }
};

export { sendMessage, broadcastMessage };
