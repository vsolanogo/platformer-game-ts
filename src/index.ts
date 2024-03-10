import * as PIXI from 'pixi.js';
import diamondpng from '@/resources/diamond.png';
import playerWalk1 from '@/resources/player_walking_1.png';
import playerWalk2 from '@/resources/player_walking_2.png';
import playerWalk3 from '@/resources/player_walking_3.png';
import playerWalk4 from '@/resources/player_walking_4.png';
import playerWalk5 from '@/resources/player_walking_5.png';
import playerWalk6 from '@/resources/player_walking_6.png';
import playerWalk7 from '@/resources/player_walking_7.png';
import playerWalk8 from '@/resources/player_walking_8.png';
import enemyWalk1 from '@/resources/enemy_walking_1.png';
import enemyWalk2 from '@/resources/enemy_walking_2.png';
import enemyWalk3 from '@/resources/enemy_walking_3.png';
import enemyWalk4 from '@/resources/enemy_walking_4.png';
import enemyWalk5 from '@/resources/enemy_walking_5.png';
import enemyWalk6 from '@/resources/enemy_walking_6.png';
import enemyWalk7 from '@/resources/enemy_walking_7.png';
import enemyWalk8 from '@/resources/enemy_walking_8.png';
import { WIDTH, HEIGHT } from './constants';
import { PublisherSubscriberEnemyPath } from './PublisherSubscriber';
import { createObstacleSprite } from './ObstacleSprite';

let thePath: number[][];
export type Point = {
  x: number;
  y: number;
};
const myMatrix: number[][] = [];

for (let i = 0; i < HEIGHT; i++) {
  const innerArray: number[] = new Array(WIDTH).fill(0);
  myMatrix.push(innerArray);
}

const graphics = new PIXI.Graphics();

const drawPoints = (points: number[][]): void => {
  // Clear the existing graphics
  graphics.clear();

  // Draw points
  points.forEach((point) => {
    graphics.beginFill(0xff0000); // Red color, you can change it as needed
    graphics.drawCircle(point[0], point[1], 1); // Adjust the radius of the circle as needed
    graphics.endFill();
  });
};

const playerWalkingArr = [
  playerWalk1,
  playerWalk2,
  playerWalk3,
  playerWalk4,
  playerWalk5,
  playerWalk6,
  playerWalk7,
  playerWalk8,
];

const enemyWalkingArr = [
  enemyWalk1,
  enemyWalk2,
  enemyWalk3,
  enemyWalk4,
  enemyWalk5,
  enemyWalk6,
  enemyWalk7,
  enemyWalk8,
];

const options = {
  backgroundColor: 0xeba9c3,
  width: WIDTH,
  height: HEIGHT,
};

export type GameState = 'idle' | 'playing' | 'lost' | 'won';
export type ArrowPress = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';

// will generate 10-20 diamonds
const DIAMONDS_COUNT = Math.floor(Math.random() * (20 - 10 + 1)) + 10;

let state: GameState = 'idle';

const createPlayerAnimation = (): PIXI.AnimatedSprite => {
  const keyFramesCount = 7;
  const keyFrames = [];
  for (let i = 0; i <= keyFramesCount; i++) {
    keyFrames.push(PIXI.Texture.from(playerWalkingArr[i]));
  }

  return new PIXI.AnimatedSprite(keyFrames);
};

const createEnemyAnimation = (): PIXI.AnimatedSprite => {
  const keyFramesCount = 7;
  const keyFrames = [];
  for (let i = 0; i <= keyFramesCount; i++) {
    keyFrames.push(PIXI.Texture.from(enemyWalkingArr[i]));
  }

  return new PIXI.AnimatedSprite(keyFrames);
};

const checkCollision = (
  playerSprite: PIXI.Sprite,
  diamonds: PIXI.Container,
): void => {
  for (const diamond of diamonds.children) {
    if (diamond.getBounds().intersects(playerSprite.getBounds())) {
      diamonds.removeChild(diamond);
      diamondsCollected += 1;
    }
  }
};

const checkCollisionWithEnemy = (
  playerSprite: PIXI.Sprite,
  enemySprite: PIXI.Sprite,
): void => {
  if (enemySprite.getBounds().intersects(playerSprite.getBounds())) {
    state = 'lost';
  }
};

const attachListeners = (keysMap: { [key: string]: boolean }): void => {
  document.onkeydown = (event): void => {
    keysMap[event.code] = true;
  };

  document.onkeyup = (event): void => {
    keysMap[event.code] = false;
  };
};

const tryToMovePlayer = (
  keysMap: { [key: string]: boolean },
  playerAnimatedSprite: PIXI.AnimatedSprite,
  delay: number,
): void => {
  let isMoving = false;
  const speed = 4;
  if (keysMap['ArrowLeft']) {
    playerAnimatedSprite.position.x -= delay * speed;
    playerAnimatedSprite.scale.x = 1;
    isMoving = true;
  }
  if (keysMap['ArrowRight']) {
    playerAnimatedSprite.position.x += delay * speed;
    playerAnimatedSprite.scale.x = -1;
    isMoving = true;
  }
  if (keysMap['ArrowUp']) {
    playerAnimatedSprite.position.y -= delay * speed;
    isMoving = true;
  }
  if (keysMap['ArrowDown']) {
    playerAnimatedSprite.position.y += delay * speed;
    isMoving = true;
  }

  const playerBounds = playerAnimatedSprite.getBounds();

  if (playerBounds.left > options.width) {
    playerAnimatedSprite.position.x = 0;
  } else if (playerBounds.right < 0) {
    playerAnimatedSprite.position.x = options.width;
  }
  if (playerBounds.top > options.height) {
    playerAnimatedSprite.position.y = 0;
  } else if (playerBounds.bottom < 0) {
    playerAnimatedSprite.position.y = options.height;
  }

  if (isMoving) {
    playerAnimatedSprite.play();
  } else {
    playerAnimatedSprite.stop();
  }
};

let pathTraversal: number = 0;
let interval = 0.0;

const tryToMoveEnemy = (
  animatedEnemySprite: PIXI.AnimatedSprite,
  animatedPlayerSprite: PIXI.AnimatedSprite,
  pubSubEnemyPathInstance: PublisherSubscriberEnemyPath,
  delay: number,
): void => {
  animatedEnemySprite.play();
  const speed = 1.5;

  if (interval >= 5) {
    sendPaths(
      animatedPlayerSprite,
      animatedEnemySprite,
      pubSubEnemyPathInstance,
    );
    interval = 0.0;
  }
  interval += delay;

  if (animatedEnemySprite.position.x <= 0) {
    animatedEnemySprite.position.x += delay * speed;
    animatedEnemySprite.scale.x = 1;
  }

  if (animatedEnemySprite.position.y <= 0) {
    animatedEnemySprite.position.y += delay * speed;
  }

  try {
    if (
      animatedEnemySprite.position.x > 0 &&
      animatedEnemySprite.position.y > 0
    ) {
      if (animatedEnemySprite.position.x > thePath[pathTraversal + 1][0]) {
        animatedEnemySprite.scale.x = -1;
      } else {
        animatedEnemySprite.scale.x = 1;
      }
      animatedEnemySprite.position.x = thePath[pathTraversal + 1][0];
      animatedEnemySprite.position.y = thePath[pathTraversal + 1][1];

      pathTraversal++;
    }
  } catch (e) {
    console.log(e);
  }
};

let diamondsCollected = 0;

const subscribeToPath = (path: number[][]): void => {
  thePath = path;
  drawPoints(thePath);
  pathTraversal = 0;
};

const sendPaths = (
  animatedPlayerSprite: PIXI.Sprite,
  animatedEnemySprite: PIXI.Sprite,
  pubSubEnemyPathInstance: PublisherSubscriberEnemyPath,
): void => {
  const { x: playerX, y: playerY } = animatedPlayerSprite.getBounds();
  const { x: enemyX, y: enemyY } = animatedEnemySprite.getBounds();
  const playerXY: Point = {
    x: Math.max(0, Math.round(playerX)),
    y: Math.max(0, Math.round(playerY)),
  };
  const enemyXY: Point = {
    x: Math.max(0, Math.round(enemyX)),
    y: Math.max(0, Math.round(enemyY)),
  };

  pubSubEnemyPathInstance.publish(playerXY, enemyXY);
};

const updateMatrixWithObstacle = (
  obstacleSprite: PIXI.Sprite,
  matrix: number[][],
): void => {
  // use event update to get read width and height
  obstacleSprite.texture.once('update', () => {
    const { x, y, width, height } = obstacleSprite.getBounds();

    const startX = Math.floor(x);
    const endX = Math.ceil(x + width);
    const startY = Math.floor(y);
    const endY = Math.ceil(y + height);

    for (let i = startY; i < endY; i++) {
      for (let j = startX; j < endX; j++) {
        if (matrix[i] && matrix[i][j] !== undefined) {
          matrix[i][j] = 1;
        }
      }
    }
  });
};

const createGameScene = (
  gameScene: PIXI.Container,
): ((delay: number) => void) => {
  const obstacleSprite = createObstacleSprite();
  gameScene.addChild(obstacleSprite);
  updateMatrixWithObstacle(obstacleSprite, myMatrix);

  const pubSubEnemyPathInstance = new PublisherSubscriberEnemyPath(myMatrix);
  pubSubEnemyPathInstance.subscribe(subscribeToPath);

  const player = new PIXI.Container();
  gameScene.addChild(player);

  const diamonds = new PIXI.Container();
  gameScene.addChild(diamonds);

  const animatedPlayerSprite = createPlayerAnimation();
  animatedPlayerSprite.position.x = 100;
  animatedPlayerSprite.position.y = 150;
  animatedPlayerSprite.animationSpeed = 0.05;
  // animatedPlayerSprite.anchor.set(0.5);

  player.addChild(animatedPlayerSprite);

  const animatedEnemySprite = createEnemyAnimation();
  animatedEnemySprite.position.x = -70;
  animatedEnemySprite.position.y = -70;
  animatedEnemySprite.animationSpeed = 0.05;
  // animatedEnemySprite.anchor.set(0.5);

  player.addChild(animatedEnemySprite);

  for (let i = 0; i < DIAMONDS_COUNT; i++) {
    const diamond = PIXI.Sprite.from(diamondpng);
    diamonds.addChild(diamond);
  }

  for (const diamond of diamonds.children) {
    diamond.position.set(
      Math.floor(Math.random() * (WIDTH - 35)),
      Math.floor(Math.random() * (HEIGHT - 28)),
    );
  }

  const keysMap = {};
  attachListeners(keysMap);

  return (delay: number): void => {
    tryToMovePlayer(keysMap, animatedPlayerSprite, delay);
    checkCollision(animatedPlayerSprite, diamonds);
    checkCollisionWithEnemy(animatedPlayerSprite, animatedEnemySprite);
    tryToMoveEnemy(
      animatedEnemySprite,
      animatedPlayerSprite,
      pubSubEnemyPathInstance,
      delay,
    );
  };
};

const style = new PIXI.TextStyle({
  fill: '#FFFFFF',
  fontSize: 30,
  fontStyle: 'italic',
});

const getWonScene = (
  app: PIXI.Application<HTMLCanvasElement>,
): PIXI.Container<PIXI.DisplayObject> => {
  const wonScene = new PIXI.Container();
  const wonText = new PIXI.Text(
    `You won, diamonds collected: ${DIAMONDS_COUNT}`,
    style,
  );
  wonText.x = app.view.width / 2 - wonText.width / 2;
  wonText.y = 30;
  wonScene.addChild(wonText);
  return wonScene;
};

const getIdleScene = (
  app: PIXI.Application<HTMLCanvasElement>,
  cb: () => void,
): PIXI.Container<PIXI.DisplayObject> => {
  const idleGameScene = new PIXI.Container();

  const idleGameText = new PIXI.Text('Start Game', style);
  idleGameText.x = app.view.width / 2 - idleGameText.width / 2;
  idleGameText.y = app.view.height / 2 - idleGameText.height / 2;
  idleGameText.eventMode = 'static';
  idleGameText.cursor = 'pointer';

  idleGameScene.addChild(idleGameText);

  idleGameText.on('pointerdown', () => {
    cb();
  });

  return idleGameScene;
};

const getLostScene = (
  app: PIXI.Application<HTMLCanvasElement>,
): PIXI.Container<PIXI.DisplayObject> => {
  const lostScene = new PIXI.Container();
  const lostText = new PIXI.Text(
    `Game over, total score: ${diamondsCollected}`,
    style,
  );
  lostText.x = app.view.width / 2 - lostText.width / 2;
  lostText.y = 30;
  lostScene.addChild(lostText);
  return lostScene;
};

const getGameScene = (
  app: PIXI.Application<HTMLCanvasElement>,
): {
  gameScene: PIXI.Container<PIXI.DisplayObject>;
  counterText: PIXI.Text;
} => {
  const gameScene = new PIXI.Container();

  const style = new PIXI.TextStyle({
    fill: 0xffffff,
  });

  const counterText = new PIXI.Text('Collected: 0', style);
  counterText.x = app.view.width / 2 - counterText.width / 2;
  counterText.y = 30;
  gameScene.addChild(counterText);

  return { gameScene, counterText };
};

const mainFunc = (): void => {
  const app = new PIXI.Application<HTMLCanvasElement>(options);

  app.stage.addChild(graphics);

  let currentScene: PIXI.Container<PIXI.DisplayObject>;
  let counterText: PIXI.Text;
  let currentGameScene: PIXI.Container<PIXI.DisplayObject>;

  let updateScene: (delay: number) => void;

  document.body.appendChild(app.view);

  const handleGameStart = (): void => {
    app.stage.removeChild(currentScene);

    const { gameScene: gs, counterText: ct } = getGameScene(app);

    counterText = ct;
    currentScene = gs;
    currentGameScene = currentScene;
    app.stage.addChild(currentScene);

    updateScene = createGameScene(currentGameScene);
  };

  const onIdleTextClick = (): void => {
    handleGameStart();
    state = 'playing';
  };

  app.ticker.add((delay: number) => {
    if (state === 'idle') {
      app.stage.removeChild(currentScene);
      currentScene = getIdleScene(app, () => {
        onIdleTextClick();
      });
      app.stage.addChild(currentScene);
    } else if (state === 'playing') {
      counterText.text = `Collected: ${diamondsCollected}`;
      if (diamondsCollected === DIAMONDS_COUNT) {
        state = 'won';
      }
      updateScene(delay);
    } else if (state === 'won') {
      app.stage.removeChild(currentScene);
      currentScene = getWonScene(app);
      app.stage.addChild(currentScene);
    } else if (state === 'lost') {
      app.stage.removeChild(currentScene);
      currentScene = getLostScene(app);
      app.stage.addChild(currentScene);
    }
  });
};

mainFunc();
