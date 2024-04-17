import * as Pixi from "pixi.js";
import { V, V2d } from "../Vector";
import { GameSprite } from "../entity/Entity";
import { Camera2d } from "./Camera2d";
import { LayerInfo } from "./LayerInfo";

export interface GameRenderer2dOptions extends Partial<Pixi.RendererOptions> {}

/** The thing that renders stuff to the screen. Mostly for handling layers. */
export class GameRenderer2d {
  layerInfos: Map<string, LayerInfo> = new Map();
  private cursor: CSSStyleDeclaration["cursor"] = "none";
  defaultLayer: string = "_default";
  spriteCount: number = 0;

  app: Pixi.Application;
  camera: Camera2d;

  get stage(): Pixi.Container {
    return this.app.stage;
  }

  get canvas(): HTMLCanvasElement {
    return this.app.renderer.canvas;
  }

  constructor(private onResize?: ([width, height]: [number, number]) => void) {
    this.app = new Pixi.Application();
    this.showCursor();
    this.camera = new Camera2d(this);
    this.createLayer(this.defaultLayer, new LayerInfo());
    window.addEventListener("resize", () => this.handleResize());
  }

  async init(pixiOptions: GameRenderer2dOptions = {}) {
    await this.app
      .init({
        resizeTo: window,
        autoDensity: true,
        antialias: false,
        ...pixiOptions,
      })
      .then(() => {
        document.body.appendChild(this.canvas);

        // const makeFullScreen = () => {
        //   this.canvas.requestFullscreen();
        //   this.canvas.removeEventListener("click", makeFullScreen);
        // };
        // this.canvas.addEventListener("click", makeFullScreen);
      });
  }

  private getLayerInfo(layerName: string) {
    const layerInfo = this.layerInfos.get(layerName);
    if (!layerInfo) {
      throw new Error(`Cannot find layer: ${layerName}`);
    }
    return layerInfo;
  }

  createLayer(name: string, layerInfo: LayerInfo) {
    this.layerInfos.set(name, layerInfo);
    this.app.stage.addChild(layerInfo.container);
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
    for (const layerInfo of this.layerInfos.values()) {
      this.camera.updateLayer(layerInfo);
    }
    this.app.render();
    if (this.app.renderer.view.canvas.style) {
      this.app.renderer.view.canvas.style.cursor = this.cursor;
    }
  }

  addSprite(sprite: GameSprite): GameSprite {
    const layerName = sprite.layerName ?? this.defaultLayer;
    this.getLayerInfo(layerName).container.addChild(sprite);
    this.spriteCount += 1;
    return sprite;
  }

  // Remove a child from a specific layer.
  removeSprite(sprite: GameSprite): void {
    const layerName = sprite.layerName ?? this.defaultLayer;
    this.getLayerInfo(layerName).container.removeChild(sprite);
    this.spriteCount -= 1;
  }

  addLayerFilter(filter: Pixi.Filter, layerName: string): void {
    const layer = this.getLayerInfo(layerName).container;
    if (!(layer.filters instanceof Array)) {
      throw new Error("layer.filters is not an array");
    }
    layer.filters;
    layer.filters = [...layer.filters!, filter];
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
