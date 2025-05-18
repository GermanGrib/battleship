import { Player, RegistrationData } from "./types";

export const players: Record<string, Player> = {};

let lastPlayerId = 0;

export function generatePlayerId(): number {
  return ++lastPlayerId;
}

export function addPlayer(data: RegistrationData): Player {
  const id = generatePlayerId();
  const player: Player = {
    id,
    name: data.name,
    password: data.password,
    wins: 0,
    ws: null,
  };
  players[id] = player;
  return player;
}

export function findPlayerByName(name: string): Player | undefined {
  return Object.values(players).find((p) => p.name === name);
}
