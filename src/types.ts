interface RegistrationRequestData {
  name: string;
  password: string;
}

interface AddUserToRoomRequestData {
  indexRoom: number | string;
}

interface RegistrationResponseData {
  name: string;
  index: number | string;
  error: boolean;
  errorText: string;
}

interface UpdateRoomResponseData {
  roomId: number | string;
  roomUsers: {
    name: string;
    index: number | string;
  }[];
}

interface CreateGameResponseData {
  idGame: number | string;
  idPlayer: number | string;
}

interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  length: 1 | 2 | 3 | 4;
  type: "small" | "medium" | "large" | "huge";
}

type WSMessage =
  | {
      type: "reg";
      data: RegistrationRequestData;
      id: number;
    }
  | {
      type: "reg";
      data: RegistrationResponseData;
      id: number;
    }
  | {
      type: "create_room";
      data: UpdateRoomResponseData[];
      id: number;
    }
  | {
      type: "update_room";
      data: UpdateRoomResponseData[];
      id: number;
    }
  | {
      type: "add_user_to_room";
      data: AddUserToRoomRequestData;
      id: number;
    }
  | {
      type: "create_game";
      data: CreateGameResponseData;
      id: number;
    }
  | {
      type: "error";
      data: { errorText: string };
      id: number;
    };

export type { WSMessage, Ship };
