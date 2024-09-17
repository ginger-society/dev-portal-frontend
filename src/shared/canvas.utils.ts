export function calculatePath(
  rect1: DOMRect | undefined,
  rect2: DOMRect | undefined,
  fromRow: number,
  toRow: number,
  rows1: number,
  rows2: number,
) {
  if (!rect1 || !rect2) return { d: "", midX: 0, midY: 0 };

  const distanceRightLeft = Math.abs(rect1.right - rect2.left);
  const distanceLeftRight = Math.abs(rect1.left - rect2.right);

  let x1, y1, x2, y2;

  const headerRowHeight = 0;
  const rowHeight1 = (rect1.height - headerRowHeight) / rows1;
  const rowHeight2 = (rect2.height - headerRowHeight) / rows2;

  // Logic for starting and ending at the center-right or center-left when fromRow or toRow is -1
  if (distanceRightLeft < distanceLeftRight) {
    // rect1 is to the left of rect2
    if (fromRow === -1) {
      // Start from center-right of rect1
      x1 = rect1.right + window.scrollX;
      y1 = rect1.top + rect1.height / 2 + window.scrollY;
    } else {
      // Start from row position in rect1
      x1 = rect1.right + window.scrollX;
      y1 = rect1.top + headerRowHeight + rowHeight1 * fromRow + window.scrollY;
    }

    if (toRow === -1) {
      // End at center-left of rect2
      x2 = rect2.left + window.scrollX;
      y2 = rect2.top + rect2.height / 2 + window.scrollY;
    } else {
      // End at row position in rect2
      x2 = rect2.left + window.scrollX;
      y2 = rect2.top + headerRowHeight + rowHeight2 * toRow + window.scrollY;
    }
  } else {
    // rect1 is to the right of rect2
    if (fromRow === -1) {
      // Start from center-left of rect1
      x1 = rect1.left + window.scrollX;
      y1 = rect1.top + rect1.height / 2 + window.scrollY;
    } else {
      // Start from row position in rect1
      x1 = rect1.left + window.scrollX;
      y1 = rect1.top + headerRowHeight + rowHeight1 * fromRow + window.scrollY;
    }

    if (toRow === -1) {
      // End at center-right of rect2
      x2 = rect2.right + window.scrollX;
      y2 = rect2.top + rect2.height / 2 + window.scrollY;
    } else {
      // End at row position in rect2
      x2 = rect2.right + window.scrollX;
      y2 = rect2.top + headerRowHeight + rowHeight2 * toRow + window.scrollY;
    }
  }

  // Control points for Bezier curve
  const controlPointOffset = Math.abs(x2 - x1) / 2; // Smoother curve with distance of control points
  const controlX1 = x1 + controlPointOffset;
  const controlY1 = y1;
  const controlX2 = x2 - controlPointOffset;
  const controlY2 = y2;

  const d = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;

  // Calculate the derivative (dy/dx) of the Bezier curve at the midpoint
  const t = 0.5;
  const dx =
    3 * (1 - t) * (1 - t) * (controlX1 - x1) +
    6 * (1 - t) * t * (controlX2 - controlX1) +
    3 * t * t * (x2 - controlX2);
  const dy =
    3 * (1 - t) * (1 - t) * (controlY1 - y1) +
    6 * (1 - t) * t * (controlY2 - controlY1) +
    3 * t * t * (y2 - controlY2);

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return { d, midX: (x1 + x2) / 2, midY: (y1 + y2) / 2, angle };
}
