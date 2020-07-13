class Point {
  x: i32;
  y: i32;
};

class ProrityQueue {
  q: Map<f32, Array<Point>>;
  highestPriority: f32;

  constructor() {
    this.q = new Map();
    this.highestPriority = 0;
  }

  @inline
  push(data: Point, priority: f32): void {
    let q = this.q;
    if (!q.has(priority)) {
      q.set(priority, [data]);
    } else {
      q.get(priority).push(data);
    }
    this.highestPriority = Mathf.max(this.highestPriority, priority);
  }

  @inline
  pop(): Point {
    const data = this.q.get(this.highestPriority) || [];
    const pt = data.pop();
    if (data.length === 0) {
      this.q.delete(this.highestPriority);
      const priorities = this.q.keys();
      let max: f32 = 0;
      for (let i = 0, len = priorities.length; i < len; i++) {
        let property = unchecked(priorities[i]);
        if (property > max) max = property;
      }
      this.highestPriority = max;
    } else {
      this.q.set(this.highestPriority, data);
    }
    return pt;
  }

  @inline
  isEmpty(): boolean {
    return this.q.size === 0;
  }
}

@inline
function findPointInArray(array: Array<Point>, nx: i32, ny: i32): boolean {
  for (let i = 0, len = array.length; i < len; i++) {
    let pt = unchecked(array[i]);
    if (pt.x == nx && pt.y == ny) {
      return true;
    }
  }
  return false;
}

function neighbors(px: i32, py: i32, visited: Map<Point, Point | null>, grid: Int8Array): Array<Point> {
  const maxX = unchecked(grid[0]);
  const maxY = unchecked(grid[1]);
  const result: Array<Point> = [];
  const visitedCells: Array<Point> = visited.keys();
  for (let i = 1; i >= -1; i--) {
    for (let j = 1; j >= -1; j--) {
      let cx = px - i;
      let cy = py - j;
      if (cx === px && cy === py) {
        continue;
      }
      if (cx < 0 || cy < 0 || cx >= maxX || cy >= maxY) {
        continue;
      }
      if (findPointInArray(visitedCells, cx, cy)) {
        continue;
      }
      if (unchecked(grid[2 + (cx * maxX + cy)]) !== 0) {
        continue;
      }
      result.push({ x: cx, y: cy });
    }
  }

  return result;
}

function getCost(from: Point, to: Point): i32 {
  return 1;
}

@inline
function heuristic(fromX: i32, fromY: i32, toX: i32, toY: i32): f32 {
  // octile
  const F = Math.SQRT2 - 1;
  const dx = Math.abs(fromX - toX);
  const dy = Math.abs(fromY - toY);
  return 1 / ((dx < dy) ? F * dx + dy : F * dy + dx) as f32;
}

export function findPath(grid: Int8Array, ax: i8, ay: i8, bx: i8, by: i8): Int8Array {
  const start: Point = { x: ax, y: ay };
  const goalX: i32 = bx;
  const goalY: i32 = by;

  const frontier = new ProrityQueue();
  const cameFrom = new Map<Point, Point | null>();
  const costSoFar = new Map<Point, i32>();
  frontier.push(start, 0);
  cameFrom.set(start, null);
  costSoFar.set(start, 0);

  while (!frontier.isEmpty()) {
    const current = frontier.pop();
    // @ts-ignore
    if (!current) {
      break;
    }

    let curX = current.x;
    let curY = current.y;

    if (curX === goalX && curY === goalY) {
      let step = cameFrom.get(current);
      const path = new Array<Point>();
      while (step !== null) {
        path.push(step);
        step = cameFrom.get(step);
      }
      path.push(current);
      const len = path.length;
      const result = new Int8Array(len * 2);
      let j = 0;
      for (let i = len - 1; i >= 0; --i) {
        let p = unchecked(path[i]);
        let x = p.x as i8;
        let y = p.y as i8;
        unchecked(result[j + 0] = x);
        unchecked(result[j + 1] = y);
        j += 2;
      }
      return result;
    }

    const nbrs = neighbors(curX, curY, cameFrom, grid);
    for (let i = 0, len = nbrs.length; i < len; i++) {
      const next = unchecked(nbrs[i]);
      const newCost = costSoFar.get(current) + getCost(current, next);
      if (!costSoFar.has(next) || costSoFar.get(next) >= newCost) {
        costSoFar.set(next, newCost);
        const priority = newCost as f32 + heuristic(goalX, goalY, next.x, next.y);
        frontier.push(next, priority);
        cameFrom.set(next, current);
      }
    }
  }

  return new Int8Array(0);
}
