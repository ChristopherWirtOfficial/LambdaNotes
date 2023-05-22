export const PLAYER_SIZE = 20;

export const TICK_FACTOR = 1;

export const CAMERA_SPEED = 25; // How much the camera moves per tick.
export const CAMERA_POSITION_SCALING_FACTOR = 1; // How much the camera moves in pixels per unit of distance.
export const DEFAULT_ZOOM = 1; // Initial zoom level
export const ZOOM_SCROLL_SCALING_FACTOR = 0.0001; // How much the camera zooms in in proportion to the scroll delta
export const ZOOM_MIN = 0.1; // The minimum zoom level
export const ZOOM_MAX = 10; // The maximum zoom level

// Tile Miner knobs
// Square, for now, but with an odd number of tiles to have a center
export const MAP_SIZE = 70; // SIZExSIZE grid of tiles (and enemies on most of those tiles)
export const ENEMY_SPAWN_PADDING = 10;
export const TILE_ENEMY_DEBUG_ON = false;
export const TILE_SIZE = 50;

// Core Projectile knobs
export const TICKS_BETWEEN_ATTACKS = 10;
export const BASE_PROJECTILE_SPEED = 3;
export const ACCELERATION_FACTOR = 0.0;
export const MAX_PROJECTILE_SPEED = 7;
export const PROJECTILE_SIZE = 10;
export const MAX_TARGET_DISTANCE = 350;
export const PROJECTILE_DAMAGE = 100;

// Every tick there's a DESIRED_ENEMY_SPAWN_RATE / FRAMERATE chance of spawning an enemy (I guess lol)
export const DESIRED_ENEMY_SPAWN_RATE = 20;
export const ENEMY_DEATH_TIMEOUT = 300;
export const ENEMY_SPEED = 13;

export const ORBIT_RADIUS = 150;
export const ORBIT_EAGERNESS = 30;

// After switching to Jotai the Hard max seems to be 500, especially when calculating
//   the distance between the player and the enemy when it takes a huge performance hit.
export const MAX_ENEMIES = 100; // Soft cap of 300 probably

export const MIN_ENEMY_SIZE = 10;
export const MAX_ENEMY_SIZE = 30;

// The max number of steps between each tick to simulate
export const MAX_BETWEEN_TICK_RESOLUTION = 10;


// If we fall more than the max behind, don't try to catch up too far
// NOTE: I THINK THAT KEEPING THIS AT 1 IS THE ONLY THING THE FRAMECAPS THE TICKS.
//  Otherwise I think we try to run ticks as fast as setTimeout allows, which is almost certainly not the right approach lmao
export const MAX_QUEUED_TICKS = 1;

export const MAX_EXECUTED_TICKS = 0; // Set to 0 for no limit


// Debug flags
export const SHOW_FPS = true;
export const SHOW_AXIS = false;
export const SHOW_ENEMY_ANGLE = false;
export const SHOW_ENEMY_INSERTION_POINT = false;
