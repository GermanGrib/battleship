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
    };

export type { WSMessage };
