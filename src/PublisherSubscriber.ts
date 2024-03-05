import type { Point } from './index';
import { workerCode } from './worker-browserify';
interface FunctionWithId {
  id: string;
  func: (path: number[][]) => void;
}

const createWorker = (): Worker => {
  const blobURL = createBlobURL();
  return new Worker(blobURL);
};

const createBlobURL = (): string => {
  const response = atob(workerCode);
  const blob = new Blob([response], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
};

export class PublisherSubscriberEnemyPath {
  private subUid: number;
  private path: number[][] = [];
  private subscribers: FunctionWithId[] = [];
  private workerInstance: Worker;

  constructor() {
    this.subUid = 0;

    this.workerInstance = createWorker();
    this.workerInstance.onmessage = (e): void => {
      this.path = JSON.parse(e.data);
    };
  }

  findPathGrid(playerXY: Point, enemyXY: Point): void {
    this.workerInstance.postMessage(JSON.stringify({ playerXY, enemyXY }));
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
