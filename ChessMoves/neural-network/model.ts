import * as tf from '@tensorflow/tfjs';
import { MODEL_INPUT_SIZE } from './model-atoms';
import { BOARD_SIZE } from '../atoms';

export const MODEL_OUTPUT_SIZE = BOARD_SIZE * BOARD_SIZE; // 64

const createModel = (inputShape: number, outputShape: number) => {
  const model = tf.sequential();

  model.add(tf.layers.dense({ inputShape: [inputShape], units: 128, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: outputShape, activation: 'linear' }));

  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError',
  });

  return model;
};

const MODEL_STORAGE_URL = 'indexeddb://my-model';

// export the model for use in other files
const getModel = async () => {
  let model: tf.Sequential;
  try {
    const loadedModel = await tf.loadLayersModel(MODEL_STORAGE_URL);
    loadedModel.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError',
    });
    model = loadedModel as tf.Sequential;
  } catch (err) {
    // Model does not exist in storage, create a new one
    model = createModel(MODEL_INPUT_SIZE, MODEL_OUTPUT_SIZE);
  }

  return model;
};

export const model = await getModel();
// export const model = createModel(MODEL_INPUT_SIZE, MODEL_OUTPUT_SIZE);

export const saveModel = () => model.save(MODEL_STORAGE_URL);
