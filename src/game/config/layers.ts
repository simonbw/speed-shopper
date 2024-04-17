import Game from "../../core/Game";
import { V } from "../../core/Vector";
import { LayerInfo } from "../../core/graphics/LayerInfo";

// Layers for rendering stuff in front of other stuff
export enum Layer {
  // Stuff behind the main stuff
  BACKGROUND = "background",
  // DEFAULT: The main stuff
  MAIN = "main",
  // Stuff in front of the main stuff
  FOREGROUND = "foreground",
  // Stuff not in the world
  HUD = "hud",
  // Stuff above even the HUD
  MENU = "menu",
}

// Special layers that don't move with the camera
const PARALAX_FREE_LAYERS = [Layer.HUD, Layer.MENU];

// Set up the game to use our layers
export function initLayers(game: Game) {
  for (const layerName of Object.values(Layer)) {
    game.renderer.createLayer(layerName, new LayerInfo({}));
  }

  for (const layerName of PARALAX_FREE_LAYERS) {
    game.renderer.layerInfos.get(layerName)!.paralax = V(0, 0);
  }

  game.renderer.defaultLayer = Layer.MAIN;
}
