interface intersectsProps {
  circle: { x: number; y: number; r: number };
  rect: { x: number; y: number; width: number; height: number };
}
export const intersects = ({ circle, rect }: intersectsProps) => {
  var distX = Math.abs(circle.x - rect.x - rect.width / 2);
  var distY = Math.abs(circle.y - rect.y - rect.height / 2);

  if (distX > rect.width / 2 + circle.r) {
    return false;
  }
  if (distY > rect.height / 2 + circle.r) {
    return false;
  }

  if (distX <= rect.width / 2) {
    return true;
  }
  if (distY <= rect.height / 2) {
    return true;
  }

  var dx = distX - rect.width / 2;
  var dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= circle.r * circle.r;
};

interface intersectsRectProps {
  rect1: { x: number; y: number; width: number; height: number };
  rect2: { x: number; y: number; width: number; height: number };
}
export const intersectsRect = ({ rect1, rect2 }: intersectsRectProps) => {
  if (rect1.y + rect1.height < rect2.y) {
    return 0;
  }
  if (rect1.y > rect2.y + rect2.height) {
    return 0;
  }
  if (rect1.x + rect1.width < rect2.x) {
    return 0;
  }
  if (rect1.x > rect2.x + rect2.width) {
    return 0;
  }
  return 1;
};
