interface RegistrationRequestData {
  name: string;
  password: string;
}

interface AddUserToRoomRequestData {
  indexRoom: number | string;
}

interface AddShipsRequestData {
  gameId: number | string;
  ships: Ship[];
  indexPlayer: number | string;
}

interface AttackRequestData {
  gameId: number | string;
  x: number;
  y: number;
  indexPlayer: number | string;
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

interface StartGameResponseData {
  ships: Ship[];
  currentPlayerIndex: number | string;
}

interface UpdateWinnersResponseData {
  name: string;
  wins: number;
}

interface AttackResponseData {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number | string;
  status: "miss" | "killed" | "shot";
}

interface TurnResponseData {
  currentPlayer: number | string;
}

interface FinishResponseData {
  winPlayer: number | string;
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
      type: "add_ships";
      data: AddShipsRequestData;
      id: number;
    }
  | {
      type: "start_game";
      data: StartGameResponseData;
      id: number;
    }
  | {
      type: "update_winners";
      data: UpdateWinnersResponseData[];
      id: number;
    }
  | {
      type: "attack";
      data: AttackRequestData;
      id: number;
    }
  | {
      type: "attack";
      data: AttackResponseData;
      id: number;
    }
  | {
      type: "turn";
      data: TurnResponseData;
      id: number;
    }
  | {
      type: "finish";
      data: FinishResponseData;
      id: number;
    }
  | {
      type: "error";
      data: { errorText: string };
      id: number;
    };

export type { WSMessage, Ship };
