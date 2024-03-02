import * as PIXI from 'pixi.js';
import { AStarFinder } from 'astar-typescript';
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
const WIDTH = 600;
const HEIGHT = 500;

const options = {
  backgroundColor: 0xeba9c3,
  width: WIDTH,
  height: HEIGHT,
};

const myMatrix = [];

for (let i = 0; i < HEIGHT; i++) {
  const innerArray = new Array(WIDTH).fill(0);
  myMatrix.push(innerArray);
}

const aStarInstance: AStarFinder = new AStarFinder({
  grid: {
    matrix: myMatrix,
  },
});

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
    console.log('LOST');
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

const tryToMoveEnemy = (
  animatedPlayerSprite: PIXI.AnimatedSprite,
  animatedEnemySprite: PIXI.AnimatedSprite,
  delay: number,
): void => {
  const speed = 0.7;

  animatedEnemySprite.play();
  try {
    const { x: playerX, y: playerY } = animatedPlayerSprite.getBounds();
    const { x: enemyX, y: enemyY } = animatedEnemySprite.getBounds();

    console.log({
      x: Math.max(0, Math.floor(playerX)),
      y: Math.max(0, Math.floor(playerY)),
    });
    console.log({
      x: Math.max(0, Math.floor(enemyX)),
      y: Math.max(0, Math.floor(enemyY)),
    });
    const p = aStarInstance.findPath(
      {
        x: Math.max(0, Math.floor(playerX)),
        y: Math.max(0, Math.floor(playerY)),
      },
      {
        x: Math.max(0, Math.floor(enemyX)),
        y: Math.max(0, Math.floor(enemyY)),
      },
    );

    const newX = p[p.length - 3][0];
    const newY = p[p.length - 3][1];
    if (newX > animatedEnemySprite.position.x) {
      animatedEnemySprite.position.x += delay * speed;
      animatedEnemySprite.scale.x = 1;
    } else {
      animatedEnemySprite.position.x -= delay * speed;
      animatedEnemySprite.scale.x = -1;
    }

    if (newY > animatedEnemySprite.position.y) {
      animatedEnemySprite.position.y += delay * speed;
    } else {
      animatedEnemySprite.position.y -= delay * speed;
    }
  } catch (e) {
    console.error();
    e;
  }
};

let diamondsCollected = 0;

const createGameScene = (
  gameScene: PIXI.Container,
  diamondsCollected: number,
): ((delay: number) => void) => {
  const player = new PIXI.Container();
  gameScene.addChild(player);

  const diamonds = new PIXI.Container();
  gameScene.addChild(diamonds);

  const animatedPlayerSprite = createPlayerAnimation();
  animatedPlayerSprite.position.x = 100;
  animatedPlayerSprite.position.y = 150;
  animatedPlayerSprite.animationSpeed = 0.05;

  player.addChild(animatedPlayerSprite);

  const animatedEnemySprite = createEnemyAnimation();
  animatedEnemySprite.position.x = -70;
  animatedEnemySprite.position.y = -70;
  animatedEnemySprite.animationSpeed = 0.05;

  player.addChild(animatedEnemySprite);

  for (let i = 0; i < DIAMONDS_COUNT; i++) {
    const diamond = PIXI.Sprite.from(diamondpng);
    diamonds.addChild(diamond);
  }

  for (const diamond of diamonds.children) {
    diamond.position.set(
      Math.floor(Math.random() * (601 - 35)),
      Math.floor(Math.random() * (501 - 28)),
    );
  }

  const keysMap = {};
  attachListeners(keysMap);

  return (delay: number): void => {
    tryToMovePlayer(keysMap, animatedPlayerSprite, delay);
    checkCollision(animatedPlayerSprite, diamonds);
    checkCollisionWithEnemy(animatedPlayerSprite, animatedEnemySprite);
    tryToMoveEnemy(animatedPlayerSprite, animatedEnemySprite, delay);
  };
};

const style = new PIXI.TextStyle({
  fill: '#FFFFFF',
  fontSize: 30,
  fontStyle: 'italic',
});

const mainFunc = (): void => {
  const app = new PIXI.Application<HTMLCanvasElement>(options);

  document.body.appendChild(app.view);

  const idleGameScene = new PIXI.Container();

  const idleGameText = new PIXI.Text('Start Game', style);
  idleGameText.x = app.view.width / 2 - idleGameText.width / 2;
  idleGameText.y = app.view.height / 2 - idleGameText.height / 2;
  idleGameText.eventMode = 'static';
  idleGameText.cursor = 'pointer';

  idleGameScene.addChild(idleGameText);

  app.stage.addChild(idleGameScene);

  const gameScene = new PIXI.Container();
  const counterText = new PIXI.Text('Collected: 0', style);
  counterText.x = app.view.width / 2 - counterText.width / 2;
  counterText.y = 30;
  gameScene.addChild(counterText);

  const updateScene = createGameScene(gameScene, diamondsCollected);

  idleGameText.on('click', () => {
    state = 'playing';
    app.stage.removeChild(idleGameScene);
    app.stage.addChild(gameScene);
  });

  const wonScene = new PIXI.Container();
  const wonText = new PIXI.Text(
    `You won, diamonds collected: ${DIAMONDS_COUNT}`,
    style,
  );
  wonText.x = app.view.width / 2 - wonText.width / 2;
  wonText.y = 30;
  wonScene.addChild(wonText);

  const lostScene = new PIXI.Container();
  const lostText = new PIXI.Text(
    `Game over, total score: ${diamondsCollected}`,
    style,
  );
  lostText.x = app.view.width / 2 - lostText.width / 2;
  lostText.y = 30;
  lostScene.addChild(lostText);

  app.ticker.add((delay: number) => {
    if (state === 'playing') {
      counterText.text = `Collected: ${diamondsCollected}`;
      if (diamondsCollected === DIAMONDS_COUNT) {
        state = 'won';
      }
      updateScene(delay);
    } else if (state === 'won') {
      app.stage.removeChild(gameScene);
      app.stage.addChild(wonScene);
    } else if (state === 'lost') {
      app.stage.removeChild(gameScene);
      app.stage.addChild(lostScene);
    }
  });
};

mainFunc();
