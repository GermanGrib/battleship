import { WebSocket } from "ws";
import {
  Player,
  RegistrationData,
  RegistrationResponseData,
  WSMessage,
} from "./types";
import { addPlayer, findPlayerByName } from "./store";

export function handleMessage(ws: WebSocket, message: WSMessage) {
  switch (message.type) {
    case "reg": {
      const regResponse = handleRegistration(ws, message.data);
      return regResponse;
    }
    default:
      console.warn("Unknown message type:", message.type);
  }
}

function handleRegistration(
  ws: WebSocket,
  data: RegistrationData,
): RegistrationResponseData | undefined {
  const existingPlayer = findPlayerByName(data.name);

  const makeResponse = (
    player: Player,
    error: boolean,
    errorText: string,
  ): RegistrationResponseData => ({
    type: "reg",
    id: 0,
    data: JSON.stringify({
      name: player.name,
      index: player.id,
      error,
      errorText,
    }),
  });

  if (existingPlayer) {
    if (existingPlayer.password !== data.password) {
      return makeResponse(existingPlayer, true, "Invalid password");
    }

    existingPlayer.ws = ws;
    return makeResponse(existingPlayer, false, "");
  }

  addPlayer(data);

  const newPlayer = findPlayerByName(data.name);
  if (newPlayer) {
    newPlayer.ws = ws;
    return makeResponse(newPlayer, false, "");
  }
}
