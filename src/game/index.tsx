import { TextureStyle } from "pixi.js";
import Game from "../core/Game";
import FPSMeter from "../core/util/FPSMeter";
import { GamePreloader } from "./GamePreloader";
import { Layer, initLayers } from "./config/layers";
import GameController from "./entities/controllers/GameController";

// Do this so we can access the game from the console
declare global {
  interface Window {
    DEBUG: { game?: Game };
  }
}

async function main() {
  // Make the pixel art crisp
  TextureStyle.defaultOptions.scaleMode = "nearest";

  const game = new Game();
  await game.init({ rendererOptions: { backgroundColor: 0x001800 } });
  // Make the game accessible from the console
  window.DEBUG = { game };

  const preloader = game.addEntity(GamePreloader);
  await preloader.waitTillLoaded();
  preloader.destroy();

  initLayers(game);

  game.addEntity(new GameController());

  if (process.env.NODE_ENV === "development") {
    game.addEntity(new FPSMeter(Layer.DEBUG_HUD));
  }

  game.dispatch({ type: "goToMainMenu" });
}

window.addEventListener("load", main);
