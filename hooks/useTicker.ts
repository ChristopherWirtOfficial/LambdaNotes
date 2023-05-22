/* This is GPT-4's attempt at code-splitting useTick.ts */
import { useEffect, useRef, useState } from 'react';
import { uuid } from 'helpers';
import { TICK_LENGTH, TickFunctor } from './useTick';

export const useTicker = (callback: () => void, frequency: number) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [ callback ]);

  useEffect(() => {
    const tick = () => {
      callbackRef.current();
      setTimeout(tick, frequency);
    };

    tick();
  }, [ frequency ]);
};

export const useProgress = () => {
  const [ progress, setProgress ] = useState(0);

  return { progress, setProgress };
};

let tickFunctors: Array<TickFunctor> = [];

export const useGameFunctor = (id: string, functor: () => void, frequency: number) => {
  const functorRef = useRef(functor);

  useEffect(() => {
    functorRef.current = functor;
  }, [ functor ]);

  useEffect(() => {
    const newTickFunctor: TickFunctor = { id, functor: functorRef.current, frequency };
    tickFunctors = tickFunctors.filter(f => f.id !== id).concat(newTickFunctor);

    return () => {
      tickFunctors = tickFunctors.filter(f => f.id !== id);
    };
  }, [ id, frequency ]);
};

// useTick.ts
export const useTick = (functorArg: () => void, frequency = 1) => {
  const id = useRef(uuid()).current;
  const { progress, setProgress } = useProgress();

  useTicker(() => {
    setProgress((progress + 1) % frequency);
  }, TICK_LENGTH);

  useGameFunctor(id, functorArg, frequency);

  return { progress };
};
