importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js");

console.log('run nn-worker');
tf.setBackend('cpu');

const model = tf.sequential({
  layers: [
    tf.layers.dense({ units: 4, inputShape: [2], activation: 'sigmoid' }),
    tf.layers.dense({ units: 3,  activation: 'sigmoid' }),
    tf.layers.dense({ units: 1 })
  ]
});

model.compile({
  optimizer: tf.train.adam(0.1),
  loss: 'meanSquaredError',
});

let inputTrainingData = tf.tensor2d([
  [0,0], [0,1], [1,0], [1,1],[0,0], [0,1], [1,0], [1,1],
  [0,0], [0,1], [1,0], [1,1],[0,0], [0,1], [1,0], [1,1],
  [0,0], [0,1], [1,0], [1,1],[0,0], [0,1], [1,0], [1,1],
  [0,0], [0,1], [1,0], [1,1],[0,0], [0,1], [1,0], [1,1],
  [0,0], [0,1], [1,0], [1,1],[0,0], [0,1], [1,0], [1,1],
  [0,0], [0,1], [1,0], [1,1],[0,0], [0,1], [1,0], [1,1],
  [0,0], [0,1], [1,0], [1,1],[0,0], [0,1], [1,0], [1,1],
]);
let outputTrainingData = tf.tensor2d([
  [0], [1], [1], [0], [0], [1], [1], [0],
  [0], [1], [1], [0], [0], [1], [1], [0],
  [0], [1], [1], [0], [0], [1], [1], [0],
  [0], [1], [1], [0], [0], [1], [1], [0],
  [0], [1], [1], [0], [0], [1], [1], [0],
  [0], [1], [1], [0], [0], [1], [1], [0],
  [0], [1], [1], [0], [0], [1], [1], [0],
]);

function train(batch = 40, epochs = 256) {
  model.fit(inputTrainingData, outputTrainingData, {
    batch,
    epochs,
    shuffle: true,
    callbacks: {
      onTrainEnd: () => {
        console.log('worker: model trained!');
      }
    }
  })
    .then(() => {
      postMessage({
        type: 'train',
        status: true
      });
    });
}

function updateGrid(grid = [[]]) {
  grid.forEach(row => {
    row.forEach(c => {
      c.color= model.predict(tf.tensor2d([[c.xFlat, c.yFlat]])).dataSync()[0];
    })
  })
  return grid;
}

onmessage = function ({ data }) {
  const { type } = data;

  switch (type) {
    case 'train':
      postMessage({
        type: 'train',
        status: false
      });
      train(data.batch, data.epochs);
      break;
    case 'updateGrid':
      postMessage({
        type: 'updateGrid',
        grid: updateGrid(data.grid)
      });
      break;
    default: break;
  }
  // postMessage(value);
}