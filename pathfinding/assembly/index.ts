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

  push(data: Point, priority: f32): void {
    if (!this.q.has(priority)) {
      this.q.set(priority, [data]);
    } else {
      const newData = this.q.get(priority) || [];
      newData.push(data);
      this.q.set(priority, newData);
    }
    if (priority > this.highestPriority) {
      this.highestPriority = priority;
    }
  }

  pop(): Point {
    const data = this.q.get(this.highestPriority) || [];
    const pt = data.pop();
    if (data.length === 0) {
      this.q.delete(this.highestPriority);
      const priorities = this.q.keys();
      let max: f32 = 0;
      for (let i = 0; i < priorities.length; i++) {
        if (priorities[i] > max) {
          max = priorities[i];
        }
      }
      this.highestPriority = max;
    } else {
      this.q.set(this.highestPriority, data);
    }
    return pt;
  }

  isEmpty(): boolean {
    return this.q.size === 0;
  }
}

function findPointInArray(array: Array<Point>, needle: Point): boolean {
  for (let i = 0; i < array.length; i++) {
      if (array[i].x === needle.x && array[i].y === needle.y) {
        return true;
      }
  }

  return false;
}

function neighbors(p: Point, visited: Map<Point, Point | null>, grid: Int8Array): Array<Point> {
  const maxX = grid[0];
  const maxY = grid[1];
  const result: Array<Point> = [];
  const visitedCells: Array<Point> = visited.keys();
  for (let i = 1; i >= -1; i--) {
    for (let j = 1; j >= -1; j--) {
      const candidate: Point = { x: p.x - i, y: p.y - j };
      if (candidate.x === p.x && candidate.y === p.y) {
        continue;
      }
      if (candidate.x < 0 || candidate.x >= maxX) {
        continue;
      }
      if (candidate.y < 0 || candidate.y >= maxY) {
        continue;
      }
      if (findPointInArray(visitedCells, candidate)) {
        continue;
      }
      if (grid[2 + (candidate.x * maxX + candidate.y)] !== 0) {
        continue;
      }
      result.push(candidate);
    }
  }

  return result;
}

function getCost(from: Point, to: Point): i32 {
  return 1;
}

function heuristic(from: Point, to: Point): f32 {
  // octile
  var F = Math.SQRT2 - 1;
  const dx = Math.abs(from.x - to.x);
  const dy = Math.abs(from.y - to.y);
  return 1 / ((dx < dy) ? F * dx + dy : F * dy + dx) as f32;
}

export function findPath(grid: Int8Array, ax: i8, ay: i8, bx: i8, by: i8): Int8Array {
  const start: Point = { x: ay, y: ax };
  const goal: Point = { x: by, y: bx };

  const frontier = new ProrityQueue();
  const cameFrom = new Map<Point, Point | null>();
  const costSoFar = new Map<Point, i32>();
  frontier.push(start, 0);
  cameFrom.set(start, null);
  costSoFar.set(start, 0);

  while (!frontier.isEmpty()) {
    const current: Point = frontier.pop();
    // @ts-ignore
    if (!current) {
      break;
    }

    if (current.x === goal.x && current.y === goal.y) {
      let step = cameFrom.get(current);
      const path: Array<Array<i32>> = [[current.x, current.y]];
      while (step !== null) {
        path.unshift([step.x, step.y]);
        step = cameFrom.get(step);
      }
      const result = new Int8Array(path.length * 2);
      let j = 0;
      for (let i = 0; i < path.length; i++) {
        const x: i32 = path[i][0];
        const y: i32 = path[i][1];
        result[j] = x;
        result[j + 1] = y;
        j += 2;
      }
      return result;
    }

    const nbrs = neighbors(current, cameFrom, grid);
    for (let i = 0; i < nbrs.length; i++) {
      const next: Point = nbrs[i];
      // @ts-ignore
      const newCost: i32 = costSoFar.get(current) + getCost(current, next);
      // @ts-ignore
      if (!costSoFar.has(next) || costSoFar.get(next) >= newCost) {
        costSoFar.set(next, newCost);
        const priority = newCost as f32 + heuristic(goal, next);
        frontier.push(next, priority);
        cameFrom.set(next, current);
      }
    }
  }

  return new Int8Array(0);
}
