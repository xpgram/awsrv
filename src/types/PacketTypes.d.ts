/*
The types described here are data to be passed along client-initiated events that follow a
client-server-client path.
*/


export interface JsonPoint {
  x: number;
  y: number;
}

/** Represents a drop-held-unit instruction. */
export interface TroopDropData {
  which: number;
  where: JsonPoint;
}

/** Represents a discrete unit turn-instruction in its most basic terms. */
export interface TroopOrderData {
  /** The place with which to give the order; usually contains an actor. */
  place?: JsonPoint;

  /** The actor's movement path. */
  path?: number[]; // CardinalDirection[];

  /** The codified contextual action to be taken. */
  action?: number; // Instruction;

  /** The action's codified variation. */
  which?: number;

  /** The action's point of execution. */
  focal?: JsonPoint;

  /** The seed for any random nummber generation. */
  seed: number;

  /** A list of of the actor's held units to drop onto the map. */
  drop: TroopDropData[];
}