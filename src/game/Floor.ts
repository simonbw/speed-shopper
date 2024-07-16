import { TilingSprite } from "pixi.js";
import { ImageName } from "../../resources/resources";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite } from "../core/entity/GameSprite";
import { V2d } from "../core/Vector";
import { Persistence } from "./config/constants";

export class Floor extends BaseEntity implements Entity {
  persistenceLevel: Persistence = Persistence.Game;
  sprite: TilingSprite & GameSprite;

  constructor(
    topLeft: V2d,
    bottomRight: V2d,
    texture: ImageName = "tileFloor13",
    scale: number = 0.004
  ) {
    super();

    this.sprite = TilingSprite.from(texture);
    this.sprite.layerName = "floor";

    this.sprite.position.set(topLeft.x, topLeft.y);
    this.sprite.width = bottomRight.x - topLeft.x;
    this.sprite.height = bottomRight.y - topLeft.y;

    this.sprite.tileScale.set(scale);
  }
}
