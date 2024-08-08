export function calculatePath(
  rect1: DOMRect | undefined,
  rect2: DOMRect | undefined,
  fromRow: number,
  toRow: number,
  rows1: number,
  rows2: number,
) {
  if (!rect1 || !rect2) return { d: "", midX: 0, midY: 0 };

  const headerRowHeight = 50; // Assuming header row height is 50px
  const rowHeight1 = (rect1.height - headerRowHeight) / rows1;
  const rowHeight2 = (rect2.height - headerRowHeight) / rows2;

  const distanceRightLeft = Math.abs(rect1.right - rect2.left);
  const distanceLeftRight = Math.abs(rect1.left - rect2.right);

  let x1, y1, x2, y2;

  if (distanceRightLeft < distanceLeftRight) {
    x1 = rect1.right;
    y1 = rect1.top + headerRowHeight + rowHeight1 * fromRow + window.scrollY;
    x2 = rect2.left;
    y2 = rect2.top + headerRowHeight + rowHeight2 * toRow + window.scrollY;
  } else {
    x1 = rect1.left;
    y1 = rect1.top + headerRowHeight + rowHeight1 * fromRow + window.scrollY;
    x2 = rect2.right;
    y2 = rect2.top + headerRowHeight + rowHeight2 * toRow + window.scrollY;
  }

  const controlPointOffset = Math.abs(x2 - x1) / 2; // Distance of control points from the start and end points
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const controlX1 = x1 + controlPointOffset;
  const controlY1 = y1;
  const controlX2 = x2 - controlPointOffset;
  const controlY2 = y2;

  const d = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;

  return { d, midX, midY };
}
