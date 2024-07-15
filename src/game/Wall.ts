import { Body, Box, vec2 } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { loadGameSprite } from "../core/entity/GameSprite";
import { V } from "../core/Vector";

export default class Wall extends BaseEntity implements Entity {
  constructor([x1, y1]: [number, number], [x2, y2]: [number, number]) {
    super();

    const width = 0.15;
    const color = 0xaaaaaa;

    const length = vec2.dist([x1, y1], [x2, y2]);
    const x = (x1 + x2) / 2;
    const y = (y1 + y2) / 2;

    const angle = V(x2 - x1, y2 - y1).angle + Math.PI / 2;

    const drawHeight = length + width / 2; // add in width to make things line up nicely

    // TODO: AO Breaks on outside corners
    const aoSprite = loadGameSprite("wallAo1", "wall-ao");
    aoSprite.blendMode = "multiply";
    aoSprite.anchor.set(0.5, 0.5);
    aoSprite.width = drawHeight;
    aoSprite.height = width;
    aoSprite.position.set(x, y);
    aoSprite.rotation = angle + Math.PI / 2;

    // TODO: Tile wall sprite rather than just stretch it
    const wallSprite = loadGameSprite("wall1", "walls");
    wallSprite.anchor.set(0.5, 0.5);
    wallSprite.width = drawHeight;
    wallSprite.height = width * 3;
    wallSprite.position.set(x, y);
    wallSprite.rotation = angle + Math.PI / 2;
    wallSprite.tint = 0xffffff;

    this.sprites = [wallSprite];

    this.body = new Body({
      mass: 0,
      position: [x, y],
      angle,
    });

    const shape = new Box({ width, height: length });
    this.body.addShape(shape);
  }
}
