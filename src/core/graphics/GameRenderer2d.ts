import * as Pixi from "pixi.js";
import { LAYERS, LayerName } from "../../config/layers";
import { V, V2d } from "../Vector";
import { GameSprite } from "../entity/GameSprite";
import { Camera2d } from "./Camera2d";
import { LayerInfo } from "./LayerInfo";

/** Options for the GameRenderer2d constructor */
export interface GameRenderer2dOptions extends Partial<Pixi.RendererOptions> {}

/** The thing that renders stuff to the screen. Mostly for handling layers.
 * TODO: Document GameRenderer2d better
 */
export class GameRenderer2d {
  // TODO: Do we really need to store this ourselves? Can't we just set it on the canvas?
  private cursor: CSSStyleDeclaration["cursor"] = "none";

  /** The number of sprites currently managed by this renderer. Mostly useful for debugging. */
  public get spriteCount() {
    return this._spriteCount;
  }
  private set spriteCount(value) {
    this._spriteCount = value;
  }
  private _spriteCount: number = 0;

  /** TODO: Document renderer.app */
  app: Pixi.Application;

  /** TODO: Document renderer.camera */
  camera: Camera2d;

  /** TODO: Document renderer.stage */
  get stage(): Pixi.Container {
    return this.app.stage;
  }

  /** TODO: Document renderer.canvas */
  get canvas(): HTMLCanvasElement {
    return this.app.renderer.canvas;
  }

  /** TODO: Document renderer constructor */
  constructor(
    private layerInfos: Record<LayerName, LayerInfo>,
    private defaultLayerName: LayerName,
    private onResize?: ([width, height]: [number, number]) => void
  ) {
    this.app = new Pixi.Application();
    this.showCursor();
    this.camera = new Camera2d(this, V(0, 0));

    for (const layerInfo of Object.values(LAYERS)) {
      this.app.stage.addChild(layerInfo.container);
    }

    window.addEventListener("resize", () => this.handleResize());
  }

  async init(pixiOptions: GameRenderer2dOptions = {}) {
    await this.app
      .init({
        resizeTo: window,
        autoDensity: true,
        antialias: true,
        ...pixiOptions,
      })
      .then(() => {
        document.body.appendChild(this.canvas);
      });
  }

  /** TODO: Document request fullscreen */
  requestFullscreen() {
    const makeFullScreen = () => {
      this.canvas.requestFullscreen();
      this.canvas.removeEventListener("click", makeFullScreen);
    };
    this.canvas.addEventListener("click", makeFullScreen);
  }

  getHeight(): number {
    return this.app.renderer.height / this.app.renderer.resolution;
  }

  getWidth(): number {
    return this.app.renderer.width / this.app.renderer.resolution;
  }

  getSize(): V2d {
    return V(this.getWidth(), this.getHeight());
  }

  handleResize() {
    this.app.resizeTo = window;
    this.app.resize();
    this.onResize?.(this.getSize());
  }

  hideCursor() {
    this.cursor = "none";
  }

  showCursor() {
    this.cursor = "auto";
  }

  setCursor(value: CSSStyleDeclaration["cursor"]) {
    this.cursor = value;
  }

  // Render the current frame.
  render() {
    for (const layerInfo of Object.values(this.layerInfos)) {
      this.camera.updateLayer(layerInfo);
    }
    this.app.render();
    if (this.app.renderer.view.canvas.style) {
      this.app.renderer.view.canvas.style.cursor = this.cursor;
    }
  }

  addSprite(sprite: GameSprite): GameSprite {
    const layerName = sprite.layerName ?? this.defaultLayerName;
    this.layerInfos[layerName].container.addChild(sprite);
    this.spriteCount += 1;
    return sprite;
  }

  // Remove a child from a specific layer.
  removeSprite(sprite: GameSprite): void {
    const layerName = sprite.layerName ?? this.defaultLayerName;
    this.layerInfos[layerName].container.removeChild(sprite);
    this.spriteCount -= 1;
  }

  addLayerFilter(filter: Pixi.Filter, layerName: LayerName): void {
    const container = this.layerInfos[layerName].container;
    if (!(container.filters instanceof Array)) {
      throw new Error("layer.filters is not an array");
    }
    container.filters;
    container.filters = [...container.filters!, filter];
  }

  addStageFilter(filter: Pixi.Filter): void {
    if (!(this.stage.filters instanceof Array)) {
      throw new Error("stage.filters is not an array");
    }
    this.stage.filters ??= [];
    this.stage.filters.push(filter);
  }

  removeStageFilter(filterToRemove: Pixi.Filter): void {
    if (!(this.stage.filters instanceof Array)) {
      throw new Error("stage.filters is not an array");
    }
    this.stage.filters = (this.stage.filters ?? []).filter(
      (filter) => filter != filterToRemove
    );
  }
}
