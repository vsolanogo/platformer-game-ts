const PF = require('pathfinding');

let gridBackup;
let finder = new PF.AStarFinder();

const matrix = [];

for (let i = 0; i < 800; i++) {
  const innerArray = new Array(1300).fill(0);
  matrix.push(innerArray);
}

let grid = new PF.Grid(matrix);

self.onmessage = (e) => {
  console.log(e);

  const parsedData = JSON.parse(e.data);
  gridBackup = grid.clone();
  const res = finder
    .findPath(
      parsedData.playerXY.x,
      parsedData.playerXY.y,
      parsedData.enemyXY.x,
      parsedData.enemyXY.y,
      grid,
    )
    .reverse();

  grid = gridBackup;

  var smoothPath = PF.Util.smoothenPath(grid, res);
  var newPath = PF.Util.expandPath(smoothPath);

  postMessage(JSON.stringify(newPath));
};
