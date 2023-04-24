
/*
  Keeps track of all debug metrics registered, using the metric param as a static individual key

  TODO: Create an aggregate hook for things like individual projectiles or enemies to use to report a value in aggregate or average

  Track changes to the value of the metric over time for later analysis
*/

// 6 months later and I'm just now remembering that I wrote this. I'm pretty sure this is really smart, but it could be dumb lmao.

import { useEffect, useState } from 'react';
import useTick from './useTick';

const metrics: { [key: string]: number } = {};
const historicMetrics: { [key: string]: number[] } = {};

const useDebugMetric = (metric: string, value: number) => {
  useEffect(() => {
    metrics[metric] = value;
    historicMetrics[metric] = [ ...historicMetrics[metric], value ];

    // Trim the historic metrics to only contain up to the last 100 values
    if (historicMetrics[metric].length > 100) {
      historicMetrics[metric] = historicMetrics[metric].slice(historicMetrics[metric].length - 100);
    }
  }, [ metric, value ]);
};

export const useDebugMetrics = () => {
  const [ tickCount, setTickCount ] = useState(0);

  useTick(() => {
    setTickCount(tickCount + 1);
  });

  return {
    tickCount,
    metrics,
    historicMetrics,
  };
};

export default useDebugMetric;
