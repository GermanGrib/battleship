import { Game, games } from "../entities/game";
import { WSMessage } from "../types";
import { players } from "../entities/player";
import {
  broadcastGameMessage,
  getRandomCoordinate,
  getSurroundingCellsForShip,
  isPlayerDefeated,
  isShipSunk,
  sendMessage,
  shipContainsCoordinate,
  updatePlayerWin,
} from "../utils/helpers";
import { gameTimers, TURN_LIMIT_MS } from "../constants";

const initNewGame = (playerIds: string[]): Game => {
  const lastGameId =
    games.size > 0
      ? Math.max(...Array.from(games.keys()).map((gameId) => parseInt(gameId)))
      : -1;
  const gameId = (lastGameId + 1).toString();
  const game = new Game(gameId, playerIds);
  games.set(gameId, game);
  console.log("New game created", game);
  return game;
};

// eslint-disable-next-line
const handleAddShips = (data: any) => {
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  console.log("handleAddShips", indexPlayer, gameId, ships);
  const game = games.get(gameId);

  if (game && game.players[indexPlayer]) {
    game.players[indexPlayer].ships = ships;

    const allPlayersReady = Object.values(game.players).every(
      (p) => p.ships.length > 0,
    );
    if (allPlayersReady) {
      sendStartGame(game);
      sendTurnMessage(game);
    } else {
      console.log("Waiting for other player to add ships", game.players);
    }
  } else {
    console.log("Game not found or player not in game");
  }
};

const sendStartGame = (game: Game) => {
  for (const clientId in game.players) {
    const player = players.get(clientId);
    if (player) {
      const message: WSMessage = {
        type: "start_game",
        data: {
          ships: game.players[clientId].ships,
          currentPlayerIndex: clientId,
        },
        id: 0,
      };

      if (player.ws) {
        sendMessage(player.ws, message);
      }
    }
  }
};

// eslint-disable-next-line
const handleAttack = (data: any) => {
  const { gameId, x, y, indexPlayer } = JSON.parse(data);
  const game = games.get(gameId);

  if (!game || game.currentTurn !== indexPlayer) {
    console.log("Invalid turn or game not found");
    return;
  }

  clearTimeout(gameTimers.get(gameId)!);
  gameTimers.delete(gameId);

  if (game && game.currentTurn === indexPlayer) {
    const opponentId = Object.keys(game.players).find(
      (id) => id !== indexPlayer,
    )!;
    const opponentData = game.players[opponentId];

    const hitShip = opponentData.ships.find((ship) => {
      return shipContainsCoordinate(ship, x, y);
    });

    let status: "miss" | "shot" | "killed" = "miss";
    if (hitShip) {
      if (
        !opponentData.shotsReceived.some((shot) => shot.x === x && shot.y === y)
      ) {
        opponentData.shotsReceived.push({ x, y });
      }
      const isKilled = isShipSunk(hitShip, opponentData.shotsReceived);
      status = isKilled ? "killed" : "shot";

      if (isKilled) {
        const surroundingCells = getSurroundingCellsForShip(hitShip);
        surroundingCells.forEach((cell) => {
          if (
            cell.x >= 0 &&
            cell.y >= 0 &&
            !opponentData.shotsReceived.some(
              (shot) => shot.x === cell.x && shot.y === cell.y,
            ) &&
            !opponentData.ships.some((ship) =>
              shipContainsCoordinate(ship, cell.x, cell.y),
            )
          ) {
            opponentData.shotsReceived.push(cell);
            const missMessage: WSMessage = {
              type: "attack",
              data: {
                position: { x: cell.x, y: cell.y },
                currentPlayer: indexPlayer,
                status: "miss",
              },
              id: 0,
            };
            broadcastGameMessage(game, missMessage);
          }
        });
      }

      if (isPlayerDefeated(opponentData)) {
        sendFinishMessage(game, indexPlayer);
        updatePlayerWin(indexPlayer);
        return;
      }
    }

    const attackMessage: WSMessage = {
      type: "attack",
      data: {
        position: { x, y },
        currentPlayer: indexPlayer,
        status,
      },
      id: 0,
    };

    broadcastGameMessage(game, attackMessage);

    if (status === "miss") {
      game.currentTurn = opponentId;
    }
    sendTurnMessage(game);
  } else {
    console.log("Invalid turn or game not found");
  }
};

const performRandomAttack = (game: Game) => {
  const playerId = game.currentTurn;
  const ws = players.get(playerId)?.ws;
  if (!ws) return;

  let x = 0;
  let y = 0;
  let validAttack = false;

  while (!validAttack) {
    x = getRandomCoordinate();
    y = getRandomCoordinate();

    const opponentId = Object.keys(game.players).find((id) => id !== playerId)!;
    const opponentData = game.players[opponentId];

    validAttack = !opponentData.shotsReceived.some(
      (shot) => shot.x === x && shot.y === y,
    );
  }

  handleAttack(
    JSON.stringify({ gameId: game.idGame, x, y, indexPlayer: playerId }),
  );
};

const startTurnTimer = (game: Game) => {
  if (gameTimers.has(game.idGame)) {
    clearTimeout(gameTimers.get(game.idGame)!);
  }

  const timer = setTimeout(() => performRandomAttack(game), TURN_LIMIT_MS);
  gameTimers.set(game.idGame, timer);
};

const sendTurnMessage = (game: Game) => {
  const message: WSMessage = {
    type: "turn",
    data: {
      currentPlayer: game.currentTurn,
    },
    id: 0,
  };

  broadcastGameMessage(game, message);
  startTurnTimer(game);
};

const sendFinishMessage = (game: Game, winnerId: string) => {
  const message: WSMessage = {
    type: "finish",
    data: {
      winPlayer: winnerId,
    },
    id: 0,
  };
  broadcastGameMessage(game, message);
};

export { initNewGame, handleAddShips, handleAttack };
