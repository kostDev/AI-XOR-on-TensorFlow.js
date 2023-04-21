const cellSize = 24;
let worker = null;
let grid = []
let btnTrain = null;

if(window.Worker) {
  worker = new Worker('./nn-worker.js')
  worker.addEventListener('message',({ data }) => {
    switch (data?.type) {
      case 'train':
        if(data.status && btnTrain) {
          btnTrain.removeAttribute('disabled');
          // use nn to update grid of pixels
          worker.postMessage({ type: 'updateGrid', grid });
        } else {
          btnTrain.attribute('disabled', true);
        }
        break;
      case 'updateGrid':
        grid = data.grid;
        break;
      default: break;
    }
  })
  worker.addEventListener('error',console.error);
}

function setup() {
  const canvas = createCanvas(528, 528);
  canvas.parent('content')

  let xFlat = 0, yFlat = 0;

  for(let y = 0, rowIndex = 0; y < width; y +=cellSize, rowIndex++) {
    grid.push([])
    for(let x = 0; x < width; x += cellSize) {
      // values for xor from 0 to 1
      xFlat = map(x, 0, width, 0, 1);
      yFlat = map(y, 0, height, 0, 1);
      grid[rowIndex].push({
        x, y,
        xFlat, yFlat,
        color: 0,
      })
    }
  }

  btnTrain = createButton('train');
  btnTrain.parent('content');
  btnTrain.mouseClicked(() => {
    worker && worker.postMessage({ type: 'train', batch: 42, epochs: 512, });
  });
}

function draw() {
  background('black');
  grid.forEach(row => {
    row.forEach(cell => {
      fill(color(cell.color * 255, cell.color * 12, cell.color * 60));
      noStroke();
      rect(cell.x, cell.y, cellSize,cellSize);
    })
  })
  // noLoop();
}