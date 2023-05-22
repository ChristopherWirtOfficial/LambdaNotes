import { useCallback, useState } from 'react';

const useTimedAverage = (windowPeriod = 1000) => {
  const [ timedValues, setTimedValues ] = useState<{ value:number, time: number }[]>([]);
  const [ average, setAverage ] = useState(0);

  const add = useCallback((value: number, time: number) => {
    const newTimedValues = timedValues.filter(({ time: t }) => t > time - windowPeriod);
    newTimedValues.push({ value, time });
    setTimedValues(newTimedValues);

    const newAverage = newTimedValues.reduce((acc, { value: v }) => acc + v, 0) / newTimedValues.length;

    setAverage(newAverage);
  }, [ timedValues, windowPeriod ]);

  return {
    add,
    average,
  };
};

export default useTimedAverage;
