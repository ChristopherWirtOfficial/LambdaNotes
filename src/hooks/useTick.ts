import { EverythingLoadedGameIsInitialized } from 'atoms/InitializationLoading';
import { now, uuid } from 'helpers';
import { MAX_EXECUTED_TICKS, MAX_QUEUED_TICKS, TICK_FACTOR } from 'helpers/knobs';
import { useAtomValue, useSetAtom, WritableAtom } from 'jotai';
import { useEffect, useState } from 'react';

// TODO: This file needs to be cleaned and code-split pretty urgently!
// Probably going to keep kicking the can until I actually start making game content and need specific useTick features
export type TickFunctor = {
  readonly id: string;
  readonly functor: (tickNumber?: number) => void;
  readonly frequency: number;
  readonly isPhysics?: boolean;
};

// TODO: DEBUGGING I really need to add a way to step through single pulses, and probably other ways to highlight specific entities or tickFunctors.
// TODO: DEBUGGING:NEXT I need to add debugging menus at some point (probably sooner rather than later) that display information about the current state of the game.
//    This would be easy to do by just having another pane to the right of the play area. Even if squares draw over it lmao

// TODO: This is basically doing nothing right now, but theoretically it could be used to have physics run at a higher rate than the framerate
export const BASE_TICKRATE = 60 * TICK_FACTOR;
export const FRAMERATE = 60 * TICK_FACTOR;

export const TICK_LENGTH = 1000 / BASE_TICKRATE;
if (TICK_LENGTH <= 1) {
  console.warn('PHYSICS TICK LENGTH IS LESS THAN 1');
}


const TICK_RATIO = BASE_TICKRATE / FRAMERATE;
if (TICK_RATIO < 1) {
  console.warn('TICK RATIO IS LESS THAN 1');
}

// const TICK_LENGTH = 1000 / FRAMERATE;

let tickFunctors: Array<TickFunctor> = [];

export const getTickFunctors = () => tickFunctors;

const functorsToSkipMap: { [key: string]: number } = {};

let lastTickTime = now();


// FOR DEBUGGING - Only simulate this number of ticks before halting, 0 disables this functionality
const HARD_STOP = MAX_EXECUTED_TICKS;
let frameCount = 0;

let leftoverTickTime = 0;
let tickLatch = 0;

// TODO: Add a way to keep track of which Pulse we're on
// export const PulseCountAtom = atom(0);

// The main tick execution loop function, looped with setTimeout(deferPulse)
const pulse = () => {
  frameCount++;
  // Check HARD_STOP debugger, if it's even on
  if (HARD_STOP > 0 && frameCount > HARD_STOP) {
    return;
  }
  // PULSE START CODE
  if (tickLatch > 0) {
    console.warn('TICK LATCH CLOSED AT PULSE START', tickLatch);
    return;
  }

  const currentTickTime = now();

  // How long has it been since we last started executing ticks?
  const elapsed = currentTickTime - lastTickTime;

  // Probably won't ever happen lmao but I think it's possible
  if (elapsed < 0) {
    console.warn('TICK ELAPSED WAS NEGATIVE', { elapsed, currentTickTime, lastTickTime });
    console.warn('This probably means that performance.now() wrapped around above its max value, which is sorta neat.');

    // Reset the lastTickTime to 0, giving us a new starting point for the next tick
    lastTickTime = 0;
  }

  // How long it's been since the last tick + the leftover time from the last tick.
  // Basically, the remainder of our fraction * the totalRequiredTickTime
  const totalRequiredTickTime = elapsed + leftoverTickTime;

  const ticksQueued = Math.min(MAX_QUEUED_TICKS, Math.floor(totalRequiredTickTime / TICK_LENGTH));
  leftoverTickTime = totalRequiredTickTime % TICK_LENGTH;

  if (ticksQueued > 5) {
    console.warn('multiple ticks queued?', ticksQueued);
  }

  // Run as many ticks as we should queue to catch up to tickrate since the last known tick
  tickLatch = ticksQueued;
  lastTickTime = currentTickTime;


  const tick = () => {
    // @ts-ignore
    // Find the functors to run this tick. The value of the functor's key in the functorsToSkipMap is the number of ticks until it should run next.
    const functorsToRun = tickFunctors.filter(f => functorsToSkipMap[f.id] === 0);

    tickFunctors.forEach(f => {
      // Update each functor's associated "ticks until next run" count in the map.
      functorsToSkipMap[f.id] = functorsToSkipMap[f.id] === 0 ? f.frequency - 1 : functorsToSkipMap[f.id] - 1;
    });

    // Run all the functors that need to be run
    // console.log(functorsToRun.map(f => f.frequency));
    const times = functorsToRun.map(({ functor }) => {
      const startTime = now();
      functor(frameCount);

      return now() - startTime;
    });

    const reportTimes = () => {
      const totalTimeExecuting = times.reduce((a, b) => a + b, 0);
      const timeUntilNextTick = TICK_LENGTH - leftoverTickTime - (now() - currentTickTime);
      if (timeUntilNextTick < 1) {
        console.log(times);
        console.log('TIME UNTIL NEXT TICK', timeUntilNextTick);
        console.log('Percent of time used this tick', totalTimeExecuting / TICK_LENGTH);
        console.log('Percent of time used this tick', totalTimeExecuting / timeUntilNextTick);

        console.warn('TIME UNTIL NEXT TICK WAS WAY TOO LOW', timeUntilNextTick);
      }
    };
    // Enable to see some valuable timing statistics
    // reportTimes();


    tickLatch--;
  };

  for (let currentTickInQueue = 0; currentTickInQueue < ticksQueued; currentTickInQueue++) {
    tick();
  }
  // PULSE END CODE
};

const timeout = TICK_LENGTH;

const deferPulse = () => {
  pulse();
  setTimeout(deferPulse, timeout);
};

setTimeout(deferPulse, timeout);

/*
  @param functor: The function to run component-level code (or any logic) per tick cadance
  @param frequency: How many ticks between each execution of the functor
*/
const useBaseTick = (functorArg: () => void, frequency = 1, isPhysics = false) => {
  const [ id ] = useState(uuid());
  const [ progress, setProgress ] = useState(0);

  // Only queue up ticks to run if the atomic state of the game is considered to be initialized
  const ticksCanRun = useAtomValue(EverythingLoadedGameIsInitialized);

  /*
    This useEffect will register or re-register a functor for the static `id` of this hook instance.
    For every use of the useTick hook, an ID is generated and remains static to the hook instance. We
    can rely on this to stay static between renders and across functor re-registrations.

    The functor used in a component, unless wrapped in a useCallback, will not be referrentialyl stable. This is
    overall a pretty useful attribute, as long as the re-registration overhead is minimal.

    Because of the lack of referential stability, every re-render we'll get a brand new reference to a brand new functor that
     has 0 stale references to other Reactive properties, instead of letting them get stale in the old functor that was passed in.
  */
  useEffect(() => {
    if (!ticksCanRun) {
      return () => {};
    }

    const functor = () => {
      // TODO: This is like this to let us track progress, but that code wasn't working. It's in git somewhere, but also it didn't work lol
      // setProgress here or something
      functorArg();
    };

    const newTickFunctors = tickFunctors.filter(f => f.id !== id);
    newTickFunctors.push({ id, functor, frequency, isPhysics });

    // Even if we re-register, we keep the same ID and consider ourselves the same functor.
    // Because of this, we only set a value for the functorsToSkipMap if there isn't one already. If there is, we don't change it.
    // This lets us keep the same cooldown between executions as the last functor, even though it was re-registered (every render, usually)
    if (functorsToSkipMap[id] === undefined) {
      functorsToSkipMap[id] = 0;
    }

    // TODO: NOTE: When re-registering because the frequency changed, don't reset the functorsToSkipMap value to zero. Instead,
    //  increase or decrease it by the difference between the old and new frequency. This way, the functor will be run next at the new frequency.
    //  This could be useful as a way to almost directly tie something like attack speed to the frequency of the tick, and get a lot of good stuff for free.


    tickFunctors = newTickFunctors;
    const cleanUp = () => {
      tickFunctors = tickFunctors.filter(f => f.functor !== functor);
    };

    return cleanUp;
  }, [ ticksCanRun, id, functorArg, frequency, isPhysics ]);

  return { progress };
};

export const usePhysicsTick = (functorArg: () => void, frequency = 1) => useBaseTick(functorArg, frequency, true);

// Used for various debugging purposes to mask the real behavior, namely the TICK_RATIO which lets us speed up and slow down the game I guess.
const useTick = (functorArg: () => void, frequency = 1) => useBaseTick(functorArg, frequency * TICK_RATIO);

export const useAtomicTick = (writeAtom: WritableAtom<void, void, void>, frequency = 1) => {
  const functor = useSetAtom(writeAtom);

  useTick(functor, frequency);
};

export default useTick;

