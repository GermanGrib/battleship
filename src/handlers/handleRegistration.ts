import { WebSocket } from "ws";
import { clients as activeConnectedClients } from "../wb_server";
import { Player, players } from "../entities/player";
import { sendMessage } from "../utils/helpers";

// eslint-disable-next-line
const handleRegistration = (ws: WebSocket, data: any, clientId: string) => {
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
};

export { handleRegistration };
