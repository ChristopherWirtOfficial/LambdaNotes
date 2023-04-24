import { atom } from 'jotai';

interface MousePosition {
  x: number | null;
  y: number | null;
}

export default atom<MousePosition>({
  x: null,
  y: null,
});
