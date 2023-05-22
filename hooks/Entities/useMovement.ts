import { atomFamily, useAtomCallback } from 'jotai/utils';
import {
  atom, Getter, SetStateAction, useAtom, useAtomValue, WritableAtom,
} from 'jotai';
import { Moveable, MovementStep } from 'types/Boxes';
import useTick from '../useTick';
import executeMovementVector from './movement-steps/executeMovementVector';

// BUG: This has a memory leak! Nothing ever removes things from this atom family
// TODO: Either use a more robust Entity manager (I really would rather not tbh...)
//  or store the movementSteps on the atom itself and make a Jotai selector that returns the movementSteps for an entity

// We're not storing them externally, but we're giving the responsability of storing them to the useMovement hook.
// They're still totally thrown away with the base entity's lifecylce. I think this should be the core of my approach,
//  to effectively avoid building any sort of robust entity manager. We'll see if damage can work in a similar way.
export const MovementStepsAtomFamily = atomFamily(() => atom([] as MovementStep<Moveable>[]));

export const useTargetMovementSteps = (key: string): MovementStep<Moveable>[] => {
  const steps = useAtomValue(MovementStepsAtomFamily(key));
  return steps;
};

// TODO: This should be generic of T extends Moveable, which is at least part of the BUG down there
export const collapseMovementSteps = (moveable: Moveable, get?: Getter): Moveable => {
  const { movementSteps } = moveable;
  // Pass the box through each movement step, always ending with the stepMovementVector step which executes our vector
  const allMovementSteps = [ ...movementSteps, executeMovementVector ];
  if (!moveable?.speed) {
    // Nothing else to do I guess, there's no speed and probably no box at all..
    console.error('No box data', { box: moveable });
    throw new Error('No box data in useMovement\'s tick');
  }

  // BUG: There's some weird typescript shit happening here. I think I have a typing issue with the MovementStep funtor type
  // @ts-ignore
  const newBox: T = allMovementSteps.reduce((boxState: Moveable, step) => {
    if (!boxState) {
      throw new Error('No box state in useMovement\'s tick');
    }

    // If there's a get function, we pass it along. If there's not, we pass that along too.
    const stepRes = step(boxState, get);
    if (!stepRes) {
      throw new Error('No step result in useMovement\'s tick');
    }

    // It's a little hack-y, but it's at least exactly how this is intended to be used
    return stepRes;
  }, moveable);

  // Update the box with the new data
  return {
    ...newBox,
    prevX: moveable.x,
    prevY: moveable.y,
  };
};

// TODO: Should this be changed to accept an Atom instead of a box and box update callback?
const useMovement = <T extends Moveable>(
  moveableAtom: WritableAtom<T, SetStateAction<T>, void>,
) => {
  const [ box, setBox ] = useAtom(moveableAtom);


  // Hoist the `get` out of useAtomCallback for the movement steps to access atomic state
  // NOTE: Currently unused, but sounds useful? Maybe for getting positions of other entities (that don't move)
  const getAtomicState = useAtomCallback((_get, _, arg) => _get(arg as any));

  useTick(() => {
    const newBox = collapseMovementSteps(box, getAtomicState);

    // TYPE ERROR :(
    setBox(newBox as any);
  });
};

export default useMovement;
