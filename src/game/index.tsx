import { TextureStyle } from "pixi.js";
import { smokeTestReady } from "../core/desktop";
import { Game } from "../core/Game";
import { setPersistedStateNamespace } from "../core/state/PersistedState";
import { TuningPanel } from "../core/tuning/TuningPanel";
import { createLeanPanel } from "../core/util/stats-overlay/LeanPanel";
import { createProfilerPanel } from "../core/util/stats-overlay/ProfilerPanel";
import { createRenderPanel } from "../core/util/stats-overlay/RenderPanel";
import { StatsOverlay } from "../core/util/stats-overlay/StatsOverlay";
import { V } from "../core/Vector";
import { CameraController } from "./CameraController";
import { Cart, isCart } from "./Cart";
import { Checkout } from "./Checkout";
import { Floor } from "./Floor";
import { GamePreloader } from "./GamePreloader";
import { Human } from "./Human";
import { isMerchandise, Merchandise } from "./Merchandise";
import { PlayerController } from "./PlayerController";
import { Shelves } from "./Shelves";
import { ShoppingList } from "./ShoppingList";
import { Wall } from "./Wall";

/**
 * Physics ticks per second, whatever the display's refresh rate: the same
 * steps on every machine. The cart's wheels (stiff traction on light casters)
 * were tuned at 120, and shimmy and skid at 60.
 */
const TICK_RATE = 120;

// Do this so we can access the game from the console
declare global {
  interface Window {
    DEBUG: { game?: Game };
  }
}

async function main() {
  // Keep this game's persisted settings separate from other games' localStorage
  setPersistedStateNamespace("speed-shopper:setting:");

  TextureStyle.defaultOptions.scaleMode = "linear";

  const params = new URLSearchParams(window.location.search);
  // ?seed=123 plays a run again; the seed is logged either way
  const seed = params.get("seed");
  const game = new Game({
    seed: seed ? Number(seed) : undefined,
    // ?tickRate=480 tries another rate
    fixedTickRate: Number(params.get("tickRate")) || TICK_RATE,
  });
  console.info(`Random seed ${game.random.seed} (play again with ?seed=)`);
  await game.init({ rendererOptions: { backgroundColor: 0x444454 } });
  // Make the game accessible from the console
  window.DEBUG = { game };

  const preloader = game.addEntity(GamePreloader);
  await preloader.waitTillLoaded();
  preloader.destroy();

  game.entities.addFilter(isCart);
  game.entities.addFilter(isMerchandise);

  if (import.meta.env.DEV) {
    // Backquote cycles through the stats panels
    game.addEntity(
      new StatsOverlay([
        createLeanPanel(),
        createProfilerPanel(),
        createRenderPanel(),
      ]),
    );
    // Backslash toggles the live tuning sliders for `//#tunable` values
    game.addEntity(new TuningPanel());
  }

  const player = game.addEntity(
    new Human({ position: V(5, 5), angle: 0, walkSpeed: 5 }),
  );
  game.addEntity(new PlayerController(player));
  game.addEntity(new CameraController(game.camera, player));

  game.addEntity(new Cart(V(5, 3)));
  game.addEntity(new Cart(V(6, 3)));
  game.addEntity(new Cart(V(7, 3)));
  game.addEntity(new Cart(V(8, 3)));

  const storeWidth = 40;
  const storeHeight = 35;
  game.addEntity(
    new Floor(V(0, 0), V(storeWidth, storeHeight), "tileFloor14", 0.005),
  );

  game.addEntities(
    new Wall([0, 0], [storeWidth, 0]),
    new Wall([storeWidth, 0], [storeWidth, storeHeight]),
    new Wall([storeWidth, storeHeight], [0, storeHeight]),
    new Wall([0, storeHeight], [0, 0]),
  );

  game.addEntities(
    new Shelves(V(10, 10)),
    new Shelves(V(15, 10)),
    new Shelves(V(20, 10)),
    new Shelves(V(25, 10)),
    new Shelves(V(30, 10)),

    new Shelves(V(10, 25)),
    new Shelves(V(15, 25)),
    new Shelves(V(20, 25)),
    new Shelves(V(25, 25)),
    new Shelves(V(30, 25)),
  );

  game.addEntities(
    new Merchandise(V(7, 10)),
    new Merchandise(V(7, 12)),
    new Merchandise(V(7, 14)),
    new Merchandise(V(7, 16)),
    new Merchandise(V(7, 18)),
    new Merchandise(V(7, 20)),
    new Merchandise(V(7, 22)),
    new Merchandise(V(7, 24)),
    new Merchandise(V(7, 26)),
    new Merchandise(V(7, 28)),
    new Merchandise(V(7, 30)),

    new Merchandise(V(31, 10)),
  );

  game.addEntity(new Checkout(V(35, 3)));
  game.addEntity(new ShoppingList());

  // In the desktop app (`npm run electron`), its smoke test waits for this
  smokeTestReady();
}

window.addEventListener("load", main);
