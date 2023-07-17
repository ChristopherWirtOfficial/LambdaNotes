import * as tfvis from '@tensorflow/tfjs-vis';
import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { model } from '../neural-network/model';
import { GameActive } from '../atoms';

export const useWeightsVisualization = () => {
  const isActive = useAtomValue(GameActive);

  useEffect(() => {
    if (!isActive) return;

    const weights = model.getWeights();

    weights.forEach((weight, i) => {
      // Flattens the tensor into 1D array
      const weightData = weight.dataSync();

      const surface = { name: `Layer ${i + 1} Weights`, tab: 'Model Weights' };
      tfvis.render.histogram(surface, Array.from(weightData), {
        width: 500,
        height: 300,
      });
    });
  }, [isActive]);
};
