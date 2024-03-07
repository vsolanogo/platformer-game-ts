import PF from 'pathfinding';
import type { Point } from './index';
import { WIDTH, HEIGHT } from './constants';

interface FunctionWithId {
  id: string;
  func: (path: number[][]) => void;
}

function scaleMatrix(
  matrix: number[][],
  newHeight: number,
  newWidth: number,
): number[][] {
  const scaledMatrix: number[][] = [];

  const height = matrix.length;
  const width = matrix[0].length;

  const scaleX = newWidth / width;
  const scaleY = newHeight / height;

  for (let i = 0; i < newHeight; i++) {
    const row: number[] = [];
    for (let j = 0; j < newWidth; j++) {
      const originalRow = Math.floor(i / scaleY);
      const originalCol = Math.floor(j / scaleX);
      row.push(matrix[originalRow][originalCol]);
    }
    scaledMatrix.push(row);
  }

  return scaledMatrix;
}

function scalePoint(
  point: [number, number],
  originalHeight: number,
  originalWidth: number,
  newHeight: number,
  newWidth: number,
): [number, number] {
  const [x, y] = point;

  const scaleX = newWidth / originalWidth;
  const scaleY = newHeight / originalHeight;

  const newX = Math.floor(x * scaleX);
  const newY = Math.floor(y * scaleY);

  return [newX, newY];
}

const NEW_HEIGHT = HEIGHT / 4;
const NEW_WIDTH = WIDTH / 4;

export class PublisherSubscriberEnemyPath {
  private subUid: number;
  private grid: number[][];
  private path: number[][] = [];
  private subscribers: FunctionWithId[] = [];

  private finder = new PF.AStarFinder();

  constructor(matrix: number[][]) {
    this.subUid = 0;
    this.grid = matrix;
  }

  findPathGrid(playerXY: Point, enemyXY: Point): void {
    const d = Date.now();
    const scaledPointPlayer = scalePoint(
      [playerXY.x, playerXY.y],
      HEIGHT,
      WIDTH,
      NEW_HEIGHT,
      NEW_WIDTH,
    );

    const scaledPointEnemy = scalePoint(
      [enemyXY.x, enemyXY.y],
      HEIGHT,
      WIDTH,
      NEW_HEIGHT,
      NEW_WIDTH,
    );
    const scaledGrid = new PF.Grid(
      scaleMatrix(this.grid, NEW_HEIGHT, NEW_WIDTH),
    );

    const path = this.finder
      .findPath(
        scaledPointPlayer[0],
        scaledPointPlayer[1],
        scaledPointEnemy[0],
        scaledPointEnemy[1],
        scaledGrid,
      )
      .reverse();

    const scaledBackPath = path.map((i) =>
      scalePoint([i[0], i[1]], NEW_HEIGHT, NEW_WIDTH, HEIGHT, WIDTH),
    );

    this.path = PF.Util.expandPath(scaledBackPath);
    console.log(Date.now() - d);
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
