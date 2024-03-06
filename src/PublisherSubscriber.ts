import PF from 'pathfinding';
import type { Point } from './index';

interface FunctionWithId {
  id: string;
  func: (path: number[][]) => void;
}

interface Cell {
  distance: number;
  visited: boolean;
  predecessor?: Point;
}

function dijkstra(
  screenWidth: number,
  screenHeight: number,
  unwalkableVertices: Point[],
): Point[] {
  const start: Point = { x: 0, y: 0 };
  const end: Point = { x: screenWidth - 1, y: screenHeight - 1 };

  // Create grid representation
  const grid: Cell[][] = [];
  for (let y = 0; y < screenHeight; y++) {
    grid[y] = [];
    for (let x = 0; x < screenWidth; x++) {
      grid[y][x] = { distance: Infinity, visited: false };
    }
  }

  // Mark unwalkable vertices
  unwalkableVertices.forEach((vertex) => {
    grid[vertex.y][vertex.x].visited = true;
  });

  const getNeighbors = (vertex: Point): Point[] => {
    const neighbors: Point[] = [];
    const { x, y } = vertex;

    // Add neighbors within screen boundaries
    if (x > 0) neighbors.push({ x: x - 1, y });
    if (x < screenWidth - 1) neighbors.push({ x: x + 1, y });
    if (y > 0) neighbors.push({ x, y: y - 1 });
    if (y < screenHeight - 1) neighbors.push({ x, y: y + 1 });

    return neighbors.filter(
      (neighbor) => !grid[neighbor.y][neighbor.x].visited,
    );
  };

  const distance = (a: Point, b: Point): number => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  };

  // Initialize Dijkstra
  grid[start.y][start.x].distance = 0;
  const queue: Point[] = [start];

  while (queue.length > 0) {
    const current: Point = queue.shift()!;
    const currentCell = grid[current.y][current.x];

    currentCell.visited = true;

    const neighbors = getNeighbors(current);
    neighbors.forEach((neighbor) => {
      const neighborCell = grid[neighbor.y][neighbor.x];
      const dist = currentCell.distance + distance(current, neighbor);
      if (dist < neighborCell.distance) {
        neighborCell.distance = dist;
        neighborCell.predecessor = current;
        queue.push(neighbor);
      }
    });
  }

  // Reconstruct path
  const path: Point[] = [];
  let current: Point | undefined = end;
  while (current) {
    path.unshift(current);
    current = grid[current.y][current.x].predecessor;
  }

  return path;
}

// Example usage
const screenWidth = 1200;
const screenHeight = 720;
const unwalkableVertices: Point[] = [
  { x: 100, y: 100 },
  { x: 200, y: 200 },
]; // Example unwalkable vertices
const shortestPath = dijkstra(screenWidth, screenHeight, unwalkableVertices);
console.log(shortestPath);

export class PublisherSubscriberEnemyPath {
  private subUid: number;
  private grid: PF.Grid;
  private gridBackup: PF.Grid;
  private path: number[][] = [];
  private subscribers: FunctionWithId[] = [];

  private finder = new PF.AStarFinder();

  constructor(matrix: number[][]) {
    this.subUid = 0;
    this.grid = new PF.Grid(matrix);
    this.gridBackup = this.grid.clone();
  }

  findPathGrid(playerXY: Point, enemyXY: Point): void {
    this.gridBackup = this.grid.clone();
    this.path = this.finder
      .findPath(playerXY.x, playerXY.y, enemyXY.x, enemyXY.y, this.grid)
      .reverse();

    this.grid = this.gridBackup;
  }

  publish(playerXY: Point, enemyXY: Point): PublisherSubscriberEnemyPath {
    this.findPathGrid(playerXY, enemyXY);

    this.subscribers.forEach((element) => {
      element.func(this.path);
    });

    return this;
  }

  subscribe(func: (path: number[][]) => void): string {
    const token = (++this.subUid).toString();
    const newSubscriber: FunctionWithId = {
      id: token,
      func,
    };
    this.subscribers.push(newSubscriber);
    return token;
  }

  unsubscribe(token: string): boolean {
    const initialLength = this.subscribers.length;
    this.subscribers = this.subscribers.filter((i) => i.id !== token);
    return this.subscribers.length !== initialLength;
  }
}
