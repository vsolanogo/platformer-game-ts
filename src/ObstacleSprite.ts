import obstacle from '@/resources/obstacle.png';
import * as PIXI from 'pixi.js';

export const createObstacleSprite = (): PIXI.Sprite => {
  const obstacleSprite = PIXI.Sprite.from(obstacle);
  obstacleSprite.position.set(200, 200);
  obstacleSprite.scale.set(0.7, 0.7);

  console.log('Obstacle sprite:', obstacleSprite);

  return obstacleSprite;
};
