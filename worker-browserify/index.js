const { AStarFinder } = require('astar-typescript');

const myMatrix = [];

for (let i = 0; i < 800; i++) {
  const innerArray = new Array(900).fill(0);
  myMatrix.push(innerArray);
}

const aStarInstance = new AStarFinder({
  grid: {
    matrix: myMatrix,
  },
  heuristic: 'Manhattan',
  includeStartNode: false,
  includeEndNode: false,
});

self.onmessage = (e) => {
  console.log({ e });

  const parsedData = JSON.parse(e.data);

  const res = aStarInstance.findPath(
    { x: parsedData.playerXY.x, y: parsedData.playerXY.y },
    { x: parsedData.enemyXY.x, y: parsedData.enemyXY.y },
  );

  postMessage(JSON.stringify(res.reverse()));
};
