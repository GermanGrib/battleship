import { players } from "../entities/player";
import { WSMessage } from "../types";
import { broadcastMessage } from "../utils/helpers";
import { Room, rooms } from "../entities/room";

export function initNewRoom(): Room {
  const lastRoomId = Array.from(rooms.keys()).reduce(
    (maxId, roomId) => Math.max(maxId, parseInt(roomId)),
    -1,
  );
  const room = new Room((lastRoomId + 1).toString());
  rooms.set(room.roomId, room);
  return room;
}

export function handleCreateRoom(clientId: string) {
  const room = initNewRoom();
  room.players.push(clientId);
  sendUpdateRoom();
}

function sendUpdateRoom() {
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
}
