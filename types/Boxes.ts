import { Getter } from 'jotai';
import { GameCoords } from './Game';

/*
  Box - Something that can be positioned on the screen
  Moveable - Something that can be moved with MovementSteps
*/
export interface Box extends GameCoords {
  key: string;
  size: number;
  color?: string;
}

// Useful for pulling the key out of a Box for library hooks, idk
export type BoxTypeOrKey<BoxType extends Box> = BoxType | Pick<BoxType, 'key'>;


/*
  Moveable boxes operate with vectors that are acted upon by specified Movement Step functions.

  Movement Steps are functions that take a Moveable box and return a new Moveable box.
  They are mutators that can act on the box's x, y, direction, and speed.
*/
export interface Moveable extends Box {
  // The actual movement vector to execute on every movement tick
  speed: number;
  direction: number;

  orbitRadius?: number;

  movementSteps: MovementStep<Moveable>[];

  // lenny-face emoji - One day... ;)
  // rotationSpeed: number;
  // rotation: number;
}

/*
  MovementSteps - functors that take a Moveable box and return a new Moveable box.
*/
type WriteGetter = Getter;
// TODO: Leaving the `get` here for now, but it causes bad practice and is currently UNUSED
export type MovementStep<T extends Moveable> = (box: T, get?: WriteGetter) => T;


export interface Enemy extends Moveable {
  health: number;
  maxHealth: number;
  damage: number;
  color: string;

  // Random debug bullshit lol
  insertionPointX?: number;
  insertionPointY?: number;
  insertionAngle?: number;
  tangentAngle?: number;
}

/*
  Projectile - A moveable that can be fired at a target with a damage
*/
export interface Projectile extends Moveable {
  readonly key: string;
  damage: number;

  // TODO: The new game's projectiles don't have a target, they just have a direction
  // The only thing that needs to know about the target is new projectiles being spawned.
  // And the only reason it "makes sense" to have it here is to recycle the target at the end of the projectile's lifecycle.
  // Which only makes sense if the target is going to be killed by the projectile. It's not ACTUALLY the solution.
  // The real solution is to track eligible targets based on bespoke game logic, and only fire toward targets that
  //   are on that list. For a basic game, the list is all enemies that don't have projectiles flying toward them that
  //   would perform a final blow on the enemy. This would have to also know how much damage is left to deal if all of the
  //   other projectiles in flight for that target actually hit it. This is FAR from impossible, but if any projectiles miss it will
  //   suddenly feel clunky. Targets are DEFINITELY business logic though, not library concerns.
  // TODO: Decouple the DrawTest's targeting system from the Projectiles entirely
  // Projectiles should NEVER AGAIN have a coupling to any specific Enemy or Player system. They just fly and hit.
  target: Moveable;

  // TODO: Projectile sources
  // sourceKey?: string;
  sourceX: number;
  sourceY: number;
}

/*
  ProjectileAtomDefinition - What we store in the actual atom family vs what we expose as the projectile
*/
export interface ProjectileAtomDefinition extends Omit<Projectile, 'target'> {
  targetKey: string;
}

// TS type for the ProjectileIntention, a Projectile without a `key` property
export type ProjectileIntention = Omit<ProjectileAtomDefinition, 'key'>;

/*
  The base definition for any given new projectile, the base ingredients you need to know
   other than the target and simulation results.
*/
export type BaseProjectileDefinition = Omit<ProjectileIntention, 'x' | 'y' | 'direction' | 'targetKey'>;

