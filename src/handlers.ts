import { WebSocket } from "ws";
import { WSMessage } from "./types";
import { clients as activeConnectedClients } from "./wb_server";
import { sendMessage } from "./utils/helpers";
import { Player, players } from "./entities/player";

export function handleMessage(
  ws: WebSocket,
  message: string,
  clientId: string,
) {
  try {
    const msg: WSMessage = JSON.parse(message);
    const { type, data } = msg;
    switch (type) {
      case "reg":
        handleRegistration(ws, data, clientId);
        break;

      // case "create_room":
      //   handleCreateRoom(ws);
      //   break;
      default:
        console.warn("Unknown message type:");
    }
  } catch (error) {
    console.warn(error);
  }
}

// eslint-disable-next-line
export function handleRegistration(ws: WebSocket, data: any, clientId: string) {
  const { name, password } = JSON.parse(data);
  console.log("handleRegistration", name, password, data, players.keys());

  let player = Array.from(players.values()).find((p) => p.name === name);

  const sendRegResponse = (error: boolean, errorText = "") => {
    sendMessage(ws, {
      type: "reg",
      data: {
        name,
        index: clientId,
        error,
        errorText,
      },
      id: 0,
    });
  };

  if (player) {
    if (player.password !== password) {
      return sendRegResponse(true, "Invalid password");
    }

    if (activeConnectedClients.has(player.clientId)) {
      console.log("Player already connected");
      return sendRegResponse(true, "User already connected");
    }

    player.ws = ws;
    player.clientId = clientId;
  } else {
    player = new Player(name, password, clientId, ws);
    players.set(clientId, player);
  }

  sendRegResponse(false);
}
