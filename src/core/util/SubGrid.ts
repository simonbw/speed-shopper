import { TilePos } from "./TilePos";

// A rectangular subsection of a grid
export class SubGrid {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {}

  has(cell: TilePos): boolean {
    const [x, y] = cell;
    return (
      x >= this.x &&
      y >= this.y &&
      x < this.x + this.width &&
      y < this.y + this.height
    );
  }
}
