import { Box } from './Boxes';

export interface TileMinerPlayer extends Box {
  damage: number;
  attackSpeed: number;
  firingDirection: number;
}
