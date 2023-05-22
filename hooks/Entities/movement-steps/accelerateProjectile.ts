import { Moveable, MovementStep } from 'types/Boxes';
import { ACCELERATION_FACTOR, MAX_PROJECTILE_SPEED } from '../../../helpers/knobs';

// A basic movement step that accelerates the projectile
const accelerateProjectile: MovementStep<Moveable> = projectile => {
  const { speed } = projectile;

  return {
    ...projectile,
    speed: Math.min(speed + (ACCELERATION_FACTOR * speed), MAX_PROJECTILE_SPEED),
  };
};

export default accelerateProjectile;
