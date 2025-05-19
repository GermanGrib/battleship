import { WebSocket } from "ws";
import { players } from "../entities/player";
import { WSMessage } from "../types";
import { broadcastMessage, sendMessage } from "../utils/helpers";
import { Room, rooms } from "../entities/room";
import { initNewGame } from "./gameHandler";

const initNewRoom = (): Room => {
  const lastRoomId = Array.from(rooms.keys()).reduce(
    (maxId, roomId) => Math.max(maxId, parseInt(roomId)),
    -1,
  );
  const room = new Room((lastRoomId + 1).toString());
  rooms.set(room.roomId, room);
  return room;
};

const handleCreateRoom = (clientId: string) => {
  const room = initNewRoom();
  room.players.push(clientId);
  sendUpdateRoom();
};

const sendUpdateRoom = () => {
  const roomList = Array.from(rooms.values())
    .filter((room) => room.players.length === 1)
    .map((room) => ({
      roomId: room.roomId,
      roomUsers: room.players.map((clientId) => {
        const player = players.get(clientId);
        return {
          name: player!.name,
          index: clientId,
        };
      }),
    }));

  const message: WSMessage = {
    type: "update_room",
    data: roomList,
    id: 0,
  };

  broadcastMessage(message);
};

const handleAddUserToRoom = (
  ws: WebSocket,
  // eslint-disable-next-line
  data: any,
  clientId: string,
) => {
  const { indexRoom } = JSON.parse(data);
  const room = rooms.get(indexRoom);
  if (room && room.players.length < 2) {
    room.players.push(clientId);
    sendUpdateRoom();
    startGame(room);
  } else {
    sendMessage(ws, {
      type: "error",
      data: { errorText: "Room not available" },
      id: 0,
    });
  }
};

const startGame = (room: Room) => {
  room.gameStarted = true;

  const game = initNewGame(room.players);
  const [player1Id, player2Id] = room.players;
  const player1 = players.get(player1Id);
  const player2 = players.get(player2Id);

  const message: WSMessage = {
    type: "create_game",
    data: {
      idGame: game.idGame,
      idPlayer: player1Id,
    },
    id: 0,
  };

  if (player1?.ws) {
    sendMessage(player1.ws, message);
  }

  message.data.idPlayer = player2Id;

  if (player2?.ws) {
    sendMessage(player2.ws, message);
  }
};

export { handleCreateRoom, handleAddUserToRoom };
