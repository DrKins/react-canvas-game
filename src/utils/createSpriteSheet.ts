export class SpriteSheet {
  spritesheet: HTMLImageElement;
  spriteWidth: number;
  spriteHeight: number;
  scale: number;
  spawnInterval: number;
  currentFrame: number;
  lastFrameTime: number;
  movementSpeed: number;
  totalCols: number;
  totalRows: number;
  private loadPromise: Promise<void>;
  private initialFrame: number;
  private lastFrame: number;

  constructor(parameters: {
    url: string;
    spriteWidth: number;
    spriteHeight: number;
    totalCols?: number;
    totalRows?: number;
    spawnInterval?: number;
    scale?: number;
    currentFrame?: number;
    lastFrameTime?: number;
    movementSpeed?: number;
    lastFrame?: number;
  }) {
    this.spritesheet = new Image();
    this.spritesheet.src = parameters.url;
    this.loadPromise = new Promise((resolve) => {
      this.spritesheet.onload = () => {
        resolve();
      };
    });
    this.spriteWidth = parameters.spriteWidth;
    this.spriteHeight = parameters.spriteHeight;

    this.scale = parameters.scale ?? 1;
    this.spawnInterval = parameters.spawnInterval ?? 1000;
    this.currentFrame = parameters.currentFrame ?? 0;
    this.lastFrameTime = parameters.lastFrameTime ?? 0;
    this.movementSpeed = parameters.movementSpeed ?? 1;
    this.initialFrame = parameters.currentFrame ?? 0;
    this.lastFrame = parameters.lastFrame ?? 0;
    this.totalCols = parameters.totalCols ?? 0;
    this.totalRows = parameters.totalRows ?? 0;
  }

  public updateCurrentFrame(currentTime: number) {
    const timeElapsed = currentTime - this.lastFrameTime;

    if (timeElapsed > this.spawnInterval) {
      const range = this.lastFrame - 1 - this.initialFrame + 1; // Range of frames
      this.currentFrame =
        this.initialFrame +
        ((this.currentFrame - this.initialFrame + 1) % range);

      this.lastFrameTime = currentTime;
    }
  }

  public async draw({
    ctx,
    x,
    y,
    spriteX,
    spriteY,
  }: {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    spriteX?: number;
    spriteY?: number;
  }) {
    await this.loadPromise;
    // draw the sprite
    ctx.drawImage(
      this.spritesheet,
      spriteX ?? this.currentFrame * this.spriteWidth,
      spriteY ?? 0,
      this.spriteWidth,
      this.spriteHeight,
      x,
      y,
      this.spriteWidth * this.scale,
      this.spriteHeight * this.scale,
    );
  }
}
