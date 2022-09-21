import { TroopOrderData } from "PacketTypes";

/**  */
export interface ClientToServerEvents {
  RequestPlayerNumber: (mapname: string) => void;
  LeaveGame: () => void;

  // Below: Client-to-client relay events

  TroopOrder: (data: TroopOrderData) => void;
  EndTurn: () => void;
  ChatMessage: (msg: string) => void;
}