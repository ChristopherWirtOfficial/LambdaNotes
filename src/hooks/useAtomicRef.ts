import { useAtom, WritableAtom } from 'jotai';
import { MutableRefObject, useCallback } from 'react';

type AtomicRefAtom<T> = WritableAtom<T, T, void>;

type UseAtomicRef = <T extends HTMLDivElement | null> (atom: AtomicRefAtom<T>) => [MutableRefObject<T>, T];

const useAtomicRef: UseAtomicRef = <T extends HTMLDivElement | null>(atom: AtomicRefAtom<T>) => {
  const atomicState = useAtom<T, T, void>(atom);
  const node = atomicState[0] as T;
  const setNode = atomicState[1];

  // This is basically all the ref is under the hood, a callback that gets called when the ref is set or updated
  // AS FAR AS I KNOW this isn't a hack, it's the only real way to make a custom React ref
  const atomicRef = useCallback((value: T) => setNode(value), [ setNode ]) as unknown as MutableRefObject<T>;

  return [ atomicRef, node ];
};

export default useAtomicRef;
