import PF from 'pathfinding';
import type { Point } from './index';

interface FunctionWithId {
  id: string;
  func: (path: number[][]) => void;
}

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
