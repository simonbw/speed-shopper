import { CustomEvents } from "../../config/CustomEvent";
import Game from "../Game";
import { BaseGameEvents } from "./BaseGameEvents";
import { EventHandler, EventHandlerName } from "./EventHandler";
import { GameSprite } from "./GameSprite";
import { IoEvents } from "./IoEvents";
import { PhysicsEvents } from "./PhysicsEvents";
import { WithOwner } from "./WithOwner";

export type GameEventMap = BaseGameEvents &
  PhysicsEvents &
  IoEvents &
  CustomEvents;

export type GameEventName = keyof GameEventMap;
export type GameEventHandlerFn<Key extends GameEventName> = (
  data: GameEventMap[Key]
) => void;
export type GameEventHandler<Key extends GameEventName> = Record<
  EventHandlerName<Key>,
  GameEventHandlerFn<Key>
>;

/**
 * A thing that responds to game events.
 */
export default interface Entity extends EventHandler<GameEventMap> {
  /** The game this entity belongs to. This should only be set by the Game. */
  game: Game | undefined;

  /** TODO: Document entity.id */
  id?: string;
  /** Tags to find entities by */
  readonly tags: ReadonlyArray<string>;

  /** Children that get added/destroyed along with this entity */
  readonly children?: Entity[];

  /** Entity that has this entity as a child */
  parent?: Entity;

  /** Used for determining if this entity should stay around when we reach a transition
   * point, like the end of a level or we change to a new menu screen */
  readonly persistenceLevel: number;

  /** True if this entity will stop updating when the game is paused. */
  readonly pausable: boolean;

  /** Called to remove this entity from the game */
  destroy(): void;

  ///////////////////////
  /// Rendering Stuff ///
  ///////////////////////

  /** TODO: Document entity.sprite */
  sprite?: GameSprite;
  /** TODO: Document entity.sprites */
  sprites?: GameSprite[];

  /////////////////////
  /// Physics Stuff ///
  /////////////////////

  /** Physics body that gets automatically added/removed from the world */
  readonly body?: p2.Body & WithOwner;

  /** Physics bodies that gets automatically added/removed from the world */
  readonly bodies?: readonly (p2.Body & WithOwner)[];

  /** Physics springs that gets automatically added/removed from the world */
  readonly springs?: p2.Spring[];

  /** Physics constraints that gets automatically added/removed from the world */
  readonly constraints?: p2.Constraint[];
}
