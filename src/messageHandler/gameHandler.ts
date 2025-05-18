import { Game, games } from "../entities/game";

export function initNewGame(playerIds: string[]): Game {
  const lastGameId =
    games.size > 0
      ? Math.max(...Array.from(games.keys()).map((gameId) => parseInt(gameId)))
      : -1;
  const gameId = (lastGameId + 1).toString();
  const game = new Game(gameId, playerIds);
  games.set(gameId, game);
  console.log("New game created", game);
  return game;
}
