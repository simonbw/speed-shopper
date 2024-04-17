import { Container } from "pixi.js";
import Game from "../Game";
import EntityPhysics from "./EntityPhysics";
import GameEventHandler from "./GameEventHandler";
import IOEventHandler from "./IOEventHandler";

/**
 * An extension of Pixi's Container class that lets us easily specify which layer a
 * sprite should be rendered in, as well as keep track of the entity that owns this sprite.  */
export interface GameSprite extends Container, WithOwner {
  layerName?: string;
}

/**
 * A thing that responds to game events.
 */
export default interface Entity
  extends GameEventHandler,
    EntityPhysics,
    IOEventHandler {
  /** The game this entity belongs to. This should only be set by the Game. */
  game: Game | undefined;

  id?: string;

  /** Children that get added/destroyed along with this entity */
  readonly children?: Entity[];

  /** Entity that has this entity as a child */
  parent?: Entity;

  /** Tags to find entities by */
  readonly tags?: ReadonlyArray<string>;

  /** Used for determining if this entity should stay around when we reach a transition
   * point, like the end of a level or we change to a new menu screen */
  readonly persistenceLevel: number;

  /** True if this entity will stop updating when the game is paused. */
  readonly pausable: boolean;

  /** Called to remove this entity from the game */
  destroy(): void;

  sprite?: GameSprite;
  sprites?: GameSprite[];
}

export interface WithOwner {
  owner?: Entity;
}
