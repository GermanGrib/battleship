import { WebSocket } from "ws";

interface Player {
  id: number;
  name: string;
  password: string;
  wins: number;
  ws: WebSocket | null;
}

interface RegistrationData {
  name: string;
  password: string;
}

interface RegistrationResponseData {
  type: "reg";
  data: string;
  id: number;
}

type WSMessage =
  | {
      type: "reg";
      data: RegistrationData;
      id: 0;
    }
  | {
      type: "reg_response";
      data: RegistrationResponseData;
      id: number;
    };

export type { Player, RegistrationResponseData, WSMessage, RegistrationData };
