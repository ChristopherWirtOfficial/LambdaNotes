import { useEffect, useState } from 'react';
import { now, uuid } from 'helpers';
import { Projectile } from '../atoms/Projectiles/ProjectileAtomFamily';
// TODO: This file needs to be cleaned and code-split pretty urgently!
// Probably going to keep kicking the can until I actually start making game content and need specific useTick features
import { Enemy } from '../atoms/Enemies/EnemyAtomFamily';

import createEventBus, { EventBus } from './EventBus';
import { GameState } from './GameState';


export interface TickAccessor {
  state: GameState;
  bus: EventBus;
}


export type TickFunctor = (tickState: TickAccessor) => GameState;

type ProjectileDictionary = { [key: string]: Projectile };


export type TickFunctorRecord = {
  readonly id: string;
  readonly functor: TickFunctor;
  readonly frequency: number;
  readonly isPhysics: boolean;
};

// TODO: DEBUGGING I really need to add a way to step through single pulses, and probably other ways to highlight specific entities or tickFunctors.
// TODO: DEBUGGING:NEXT I need to add debugging menus at some point (probably sooner rather than later) that display information about the current state of the game.
//    This would be easy to do by just having another pane to the right of the play area. Even if squares draw over it lmao

// TODO: This is basically doing nothing right now, but theoretically it could be used to have physics run at a higher rate than the framerate
export const BASE_TICKRATE = 60;
export const FRAMERATE = 60;

const TICK_LENGTH = 1000 / BASE_TICKRATE;
if (TICK_LENGTH <= 1) {
  console.warn('PHYSICS TICK LENGTH IS LESS THAN 1');
}


const TICK_RATIO = BASE_TICKRATE / FRAMERATE;
if (TICK_RATIO < 1) {
  console.warn('TICK RATIO IS LESS THAN 1');
}

// const TICK_LENGTH = 1000 / FRAMERATE;

// If we fall more than the max behind, don't try to catch up too far
//  Note: probably want to make this considerably higher than 10 ticks?
const MAX_QUEUED_TICKS = 10;

let tickFunctors: Array<TickFunctorRecord> = [];

export const getTickFunctors = () => tickFunctors;

const functorsToSkipMap: { [key: string]: number } = {};

let lastTickTime = now();

let tickLatch = 0;

// Only simulate this number of ticks before halting
const HARD_STOP = 0;
let frameCount = 0;

const counts = {
  requestAnimationFrame: 0,
  setInterval: 0,
  setTimeout: 0,
  unspecified: 0,
};

let leftoverTickTime = 0;

const eventBus = createEventBus();
let tickState: GameState = {};

// The main tick execution loop function, looped with setTimeout(deferPulse)
const pulse = () => {
  frameCount++;
  if (HARD_STOP > 0 && frameCount > HARD_STOP) {
    return;
  }
  // PULSE START CODE
  if (tickLatch > 0) {
    console.warn('TICK LATCH CLOSED AT PULSE START', tickLatch);
    return;
  }

  const currentTickTime = now();

  if (currentTickTime - lastTickTime < 0) {
    console.warn('TICK ELAPSED WAS NEGATIVE', currentTickTime - lastTickTime);
    console.warn('This probably means that performance.now() wrapped around above its max value, which is sorta neat.');

    // Reset the lastTickTime to 0, giving us ou
    lastTickTime = 0;
  }

  // How long has it been since we last started executing ticks?
  const elapsed = currentTickTime - lastTickTime;

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
    counts[source]++;

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

      tickState = functor({
        state: { ...tickState },
        bus: eventBus,
      });

      return now() - startTime;
    });

    const reportTimes = () => {
      console.log(times);
      const totalTimeExecuting = times.reduce((a, b) => a + b, 0);
      const timeUntilNextTick = TICK_LENGTH - leftoverTickTime - (now() - currentTickTime);
      console.log('TIME UNTIL NEXT TICK', timeUntilNextTick);
      console.log('Percent of time used this tick', totalTimeExecuting / TICK_LENGTH);
      console.log('Percent of time used this tick', totalTimeExecuting / timeUntilNextTick);
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

const timeout = undefined;

const deferPulse = () => {
  pulse();
  setTimeout(deferPulse, timeout);
};

setTimeout(deferPulse, timeout);

/*
  @param functor: The function to run component-level code (or any logic) per tick cadance
  @param frequency: How many ticks between each execution of the functor
*/
const useBaseTick = (functorArg: TickFunctor, frequency = 1, isPhysics = false) => {
  const [ id ] = useState(uuid());


  useEffect(() => {
    const functor = (state: TickAccessor) => {
      // TODO: This is like this to let us track progress, but that code wasn't working. It's in git somewhere, but also it didn't work lol
      // setProgress here or something
      console.log('functor called', state);

      // TODO: FAKE-P1CKUP: I think? Shouldn't I be capturing the return value of the state here?
      // And if it's undefined, I should be returning the previous state? Not touching this today though lol
      functorArg(state);
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
    return () => {
      tickFunctors = tickFunctors.filter(f => f.functor !== functor);
    };
  }, [ id, functorArg, frequency, isPhysics ]);

  return id;
};

export const usePhysicsTick = (functorArg: TickFunctor, frequency = 1) => useBaseTick(functorArg, frequency, true);

const useTick = (functorArg: TickFunctor, frequency = 1) => useBaseTick(functorArg, frequency * TICK_RATIO, false);

export default useTick;

// TODO: Probably just remove this. It was an attempt to refactor the existing collision code (at the time, pre projectiles v0.3)
// NOTE: I wasn't writing this as the first implementation of the collision code, I was actually REFACTORING
//   the existing collision code into the new useTick system as a test.
const useCollision = (projectileKey: string) => {
  useTick(({ state, bus }) => {
    const { projectiles, enemies }: { projectiles: ProjectileDictionary, enemies: Enemy[] } = state;
    const projectile: Projectile = projectiles[projectileKey];

    // Should never happen
    if (!projectile) {
      console.error('Projectile not found in state', projectileKey);
      return;
    }

    const enemyList = enemies as Enemy[];

    // Check if the projectile has collided with any enemies
    const collidedEnemies = enemyList.filter(enemy => {
      const { x, y, size } = enemy;

      if (Math.abs(x - projectile.x) < size && Math.abs(y - projectile.y) < size) {
        return true;
      }

      return false;
    });

    const collidedEnemy = collidedEnemies[0];

    if (collidedEnemy) {
      bus.emit({
        event: 'enemy-hit',
        entity: collidedEnemy.key,
      }, {
        damage: projectile.damage,
        projectile,
      });
    }

    // Remove the projectile from the state
    bus.emit({
      event: 'projectile-hit',
      entity: projectileKey,
    }, {
      projectile,
    });
  });
};
