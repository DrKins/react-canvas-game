interface generateSpriteSheetInformationsProps {
  url: string;
  spriteWidth: number;
  spriteHeight: number;
  totalCols?: number;
  totalRows?: number;
  spawnInterval?: number;
  scale?: number;
}
export const generateSpriteSheetInformations = ({
  url,
  spriteWidth,
  spriteHeight,
  totalCols = 0,
  totalRows = 0,
  spawnInterval = 1000,
  scale = 1,
}: generateSpriteSheetInformationsProps) => {
  // background field sprite sheet
  const spritesheet = new Image();
  spritesheet.src = url;

  const localSpriteWidth = spriteWidth;
  const localSpriteHeight = spriteHeight;
  const localTotalCols = totalCols;
  const localTotalRows = totalRows;
  const localSpawnInterval = spawnInterval;
  const localScale = scale;

  return {
    spritesheet,
    spriteWidth: localSpriteWidth,
    spriteHeight: localSpriteHeight,
    totalCols: localTotalCols,
    totalRows: localTotalRows,
    totalFrames: localTotalCols * localTotalRows,
    spawnInterval: localSpawnInterval,
    scale: localScale,
  };
};
