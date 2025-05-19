import { Ship, WSMessage } from "../types";
import { WebSocket } from "ws";
import { players } from "../entities/player";
import { Game } from "../entities/game";

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

const broadcastGameMessage = (game: Game, message: WSMessage) => {
  for (const clientId in game.players) {
    const player = players.get(clientId);
    if (player) {
      console.log("broadcastGameMessage", message, player.name);
      player.ws?.send(
        JSON.stringify({ ...message, data: JSON.stringify(message.data) }),
      );
    }
  }
};

const getShipCells = (ship: Ship): { x: number; y: number }[] => {
  const cells = [];
  for (let i = 0; i < ship.length; i++) {
    const x = ship.direction ? ship.position.x : ship.position.x + i;
    const y = ship.direction ? ship.position.y + i : ship.position.y;
    cells.push({ x, y });
  }
  return cells;
};

const isShipSunk = (
  ship: Ship,
  shotsReceived: { x: number; y: number }[],
): boolean => {
  const shipCells = getShipCells(ship);
  return shipCells.every((cell) =>
    shotsReceived.some((shot) => shot.x === cell.x && shot.y === cell.y),
  );
};

// eslint-disable-next-line
const isPlayerDefeated = (playerData: any): boolean => {
  for (const ship of playerData.ships) {
    if (!isShipSunk(ship, playerData.shotsReceived)) {
      return false;
    }
  }
  return true;
};

const updatePlayerWin = (clientId: string) => {
  const player = players.get(clientId);
  if (player) {
    player.wins += 1;
    sendUpdateWinners();
  }
};

const sendUpdateWinners = () => {
  const winnerList = Array.from(players.values())
    .filter((p) => !p.name.startsWith("Bot"))
    .sort((a, b) => b.wins - a.wins)
    .map((p) => ({ name: p.name, wins: p.wins }));

  const message: WSMessage = {
    type: "update_winners",
    data: winnerList,
    id: 0,
  };

  broadcastMessage(message);
};

const shipContainsCoordinate = (ship: Ship, x: number, y: number): boolean => {
  const cells = getShipCells(ship);
  return cells.some((cell) => cell.x === x && cell.y === y);
};

const getRandomCoordinate = () => {
  return Math.floor(Math.random() * 10);
};

const getSurroundingCells = (x: number, y: number) => {
  return [
    { x: x - 1, y: y - 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y },
    { x: x + 1, y: y },
    { x: x - 1, y: y + 1 },
    { x: x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ];
};

const getSurroundingCellsForShip = (ship: Ship) => {
  const surroundingCells = [];
  for (const coord of getShipCells(ship)) {
    surroundingCells.push(...getSurroundingCells(coord.x, coord.y));
  }
  return surroundingCells;
};

export {
  sendMessage,
  broadcastMessage,
  broadcastGameMessage,
  getRandomCoordinate,
  shipContainsCoordinate,
  isPlayerDefeated,
  isShipSunk,
  getSurroundingCellsForShip,
  updatePlayerWin,
};
