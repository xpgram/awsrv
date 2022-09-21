import { TroopOrderData } from "PacketTypes";

/** */
export interface ServerToClientEvents {
  GameSessionData: (plnum: number) => void;

  // Below: Client-to-client relay events

  TroopOrder: (data: TroopOrderData) => void;
  EndTurn: () => void;
  ChatMessage: (msg: string) => void;
}