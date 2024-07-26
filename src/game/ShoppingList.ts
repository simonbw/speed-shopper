import { Text } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity, { GameEventMap } from "../core/entity/Entity";
import { Merchandise, MerchandiseType } from "./Merchandise";

interface ShoppingItem {
  merchandiseType: MerchandiseType;
  numberRequired: number;
  numberPurchased: number;
}

export class ShoppingList extends BaseEntity implements Entity {
  id = "shoppingList";
  items: ShoppingItem[];
  text: Text;

  constructor() {
    super();

    this.items = [
      { merchandiseType: "orange", numberRequired: 3, numberPurchased: 0 },
    ];

    this.sprite = this.text = new Text({
      text: "Shopping List",
      style: {
        fontSize: 16,
        fill: "white",
        align: "left",
        dropShadow: {
          color: 0x000000,
          alpha: 0.5,
          angle: 0,
          distance: 0,
          blur: 2,
        },
      },
    });
    this.sprite.layerName = "hud";
  }

  onRender() {
    this.text.text = this.items
      .map(
        (item) =>
          `${item.merchandiseType} ${item.numberPurchased}/${item.numberRequired}`
      )
      .join("\n");

    this.text.position.set(this.game?.renderer.getWidth(), 0);
    this.text.anchor.set(1, 0);
  }

  onMerchandisePurchased({
    merchandise,
  }: GameEventMap["merchandisePurchased"]) {
    const item = this.items.find(
      (item) => item.merchandiseType === merchandise.merchandiseType
    );
    if (item) {
      item.numberPurchased++;
    }
  }
}
