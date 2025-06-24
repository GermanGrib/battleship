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

  const enemyPlayerId = Object.keys(game.players).find(
    (id) => id !== indexPlayer,
  )!;
  const enemyState = game.players[enemyPlayerId];

  const targetShip = enemyState.ships.find((ship) =>
    shipContainsCoordinate(ship, x, y),
  );

  let result: "miss" | "shot" | "killed" = "miss";

  if (targetShip) {
    const alreadyHit = enemyState.shotsReceived.some(
      (shot) => shot.x === x && shot.y === y,
    );
    if (!alreadyHit) {
      enemyState.shotsReceived.push({ x, y });
    }

    const isShipKilled = isShipSunk(targetShip, enemyState.shotsReceived);
    result = isShipKilled ? "killed" : "shot";

    if (isShipKilled) {
      const surroundingCells = getSurroundingCellsForShip(targetShip);
      surroundingCells.forEach(({ x: cx, y: cy }) => {
        const alreadyMarked = enemyState.shotsReceived.some(
          (shot) => shot.x === cx && shot.y === cy,
        );
        const occupied = enemyState.ships.some((ship) =>
          shipContainsCoordinate(ship, cx, cy),
        );

        if (cx >= 0 && cy >= 0 && !alreadyMarked && !occupied) {
          enemyState.shotsReceived.push({ x: cx, y: cy });

          const missAroundMessage: WSMessage = {
            type: "attack",
            data: {
              position: { x: cx, y: cy },
              currentPlayer: indexPlayer,
              status: "miss",
            },
            id: 0,
          };

          broadcastGameMessage(game, missAroundMessage);
        }
      });
    }

    if (isPlayerDefeated(enemyState)) {
      sendFinishMessage(game, indexPlayer);
      updatePlayerWin(indexPlayer);
      return;
    }
  }

  const attackResultMessage: WSMessage = {
    type: "attack",
    data: {
      position: { x, y },
      currentPlayer: indexPlayer,
      status: result,
    },
    id: 0,
  };

  broadcastGameMessage(game, attackResultMessage);

  if (result === "miss") {
    game.currentTurn = enemyPlayerId;
  }

  sendTurnMessage(game);
};

const performRandomAttack = (game: Game) => {
  const currentPlayerId = game.currentTurn;
  const currentPlayerWs = players.get(currentPlayerId)?.ws;
  if (!currentPlayerWs) return;

  let x = 0;
  let y = 0;
  let isValidTarget = false;

  const enemyPlayerId = Object.keys(game.players).find(
    (id) => id !== currentPlayerId,
  )!;
  const enemyState = game.players[enemyPlayerId];

  while (!isValidTarget) {
    x = getRandomCoordinate();
    y = getRandomCoordinate();

    const alreadyShot = enemyState.shotsReceived.some(
      (shot) => shot.x === x && shot.y === y,
    );

    isValidTarget = !alreadyShot;
  }

  handleAttack(
    JSON.stringify({
      gameId: game.idGame,
      x,
      y,
      indexPlayer: currentPlayerId,
    }),
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
