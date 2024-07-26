import { Merchandise } from "../game/Merchandise";

export type CustomEvents = {
  /** Dispatched when the game starts */
  gameStart: { message: string };
  /** Dispatched when a piece of merchandise is purchased */
  merchandisePurchased: { merchandise: Merchandise };
};
