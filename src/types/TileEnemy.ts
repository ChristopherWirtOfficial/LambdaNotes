import { GridTile } from 'helpers/grid/gameCoordsToGridTile';
import { ProjectileHit } from 'TileMiner/Enemies/atoms/useProjectileHit';
import { Enemy } from './Boxes';

export interface TileEnemy extends Enemy, GridTile {
  hits: ProjectileHit[];
}

export type TileEnemyBase = Omit<TileEnemy, 'health' | 'hits'>;

export type TileEnemyIdentifer = GridTile;

// No two enemies can have the same grid position, so if it's there, that's the same enemy
// NOTE: This is for Jotai AtomFamilies to use as a compare function
export const compareTileEnemyIdentifiers =
  (a: TileEnemyIdentifer, b: TileEnemyIdentifer) => a.gridX === b.gridX && a.gridY === b.gridY;
