import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useSaveLoadLattice } from './useSaveLoad';

const timeSinceLastSyncAtom = atom<Date | null>(new Date());
const changesSinceLastSyncAtom = atom(0);

const syncThreshold = 1;

const shouldSyncAtom = atom((get) => {
  const lastSync = get(timeSinceLastSyncAtom);
  const changesSinceLastSync = get(changesSinceLastSyncAtom);

  if (lastSync === null || changesSinceLastSync === 0) {
    // No sync has happened yet, so let's say it's not time to sync again.
    return false;
  }

  const now = new Date();
  const timeDifferenceInSeconds = (now.getTime() - lastSync.getTime()) / 1000;

  const timeRatio = timeDifferenceInSeconds / 30; // 30 seconds maximum
  const changesRatio = changesSinceLastSync / 5; // 5 changes maximum

  // We use Math.sqrt to account for the geometric mean of the ratios
  // This means that both time and changes need to be over their maximums to trigger a sync
  const syncRatio = Math.sqrt(timeRatio * changesRatio);

  return syncRatio >= syncThreshold;
});

export const useSync = () => {
  const shouldSync = useAtomValue(shouldSyncAtom);
  const setTimeSinceLastSync = useSetAtom(timeSinceLastSyncAtom);
  const { saveToLocalStorage, loadFromLocalStorage } = useSaveLoadLattice();

  useEffect(() => {
    if (shouldSync) {
      console.log('Syncing...');

      saveToLocalStorage();

      setTimeSinceLastSync(new Date());
    }
  }, [shouldSync, setTimeSinceLastSync, saveToLocalStorage]);

  useEffect(() => {
    // Load the local storage representation on mount
    loadFromLocalStorage();
    saveToLocalStorage();
  }, [loadFromLocalStorage]);
};
