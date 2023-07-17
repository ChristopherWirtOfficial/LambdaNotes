import { useSetAtom, useAtom, atom, useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { GameActive } from '../atoms';
import { PlayStepAtom } from '../neural-network/PlayStepAtom';

export const IntervalLengthAtom = atom(10);

export const useAutoPlay = () => {
  const makePlay = useSetAtom(PlayStepAtom);
  const intervalLength = useAtomValue(IntervalLengthAtom);
  const [isActive, setActive] = useAtom(GameActive);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const playRecursively = async () => {
      await makePlay();
      if (isActive) {
        setTimeout(playRecursively, intervalLength);
      }
    };

    playRecursively();
  }, [makePlay, isActive, intervalLength]);

  return { isActive, setActive };
};
