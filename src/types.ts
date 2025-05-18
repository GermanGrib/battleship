interface RegistrationRequestData {
  name: string;
  password: string;
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

type WSMessage =
  | {
      type: "reg";
      data: RegistrationRequestData;
      id: 0;
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
    };

export type { WSMessage };
