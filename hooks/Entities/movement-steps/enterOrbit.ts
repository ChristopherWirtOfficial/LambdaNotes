// Yes I'm a genius, but I don't like to show off

import { Moveable } from 'types/Boxes';
import { ORBIT_EAGERNESS, ORBIT_RADIUS } from '../../../helpers/knobs';

// When the box is close to its orbit point (default 20px from the center), change the direction to insert into an orbit around the center
export const enterOrbit = (<T extends Moveable>(box: T) => {
  const { x, y, direction, speed } = box;

  const orbitRadius = box?.orbitRadius ?? ORBIT_RADIUS;

  // Lol the orbit center could be an entity's current position lmaoo
  const orbitCenter = {
    x: 0,
    y: 0,
  };

  // If there's no orbit radius, don't do anything
  if (orbitRadius <= 0) {
    return box;
  }

  // Start moving to intercept the orbit radius at 2x the orbit radius
  const angleTowardCenter = Math.atan2(y - orbitCenter.y, x - orbitCenter.x);

  const interceptX = Math.cos(angleTowardCenter) * (orbitRadius);
  const interceptY = Math.sin(angleTowardCenter) * (orbitRadius);
  const distanceToIntercept = Math.sqrt(
    (x - interceptX) ** 2 + (y - interceptY) ** 2,
  );

  const distanceToCenter = Math.sqrt((x - orbitCenter.x) ** 2 + (y - orbitCenter.y) ** 2);

  const orbitalCircumference = 2 * Math.PI * orbitRadius;
  const first = (distanceToCenter / (3 * orbitRadius));
  const second = (speed / orbitalCircumference);

  const offset = (first + second) * (ORBIT_EAGERNESS / 20);
  // The angle one tick further along the orbit circumference at our speed
  const offsetAngle = angleTowardCenter + offset;

  const insertionPointX = Math.cos(offsetAngle) * orbitRadius;
  const insertionPointY = Math.sin(offsetAngle) * orbitRadius;

  const distanceToInsertionPoint = Math.sqrt(
    (insertionPointX - x) ** 2 + (insertionPointY - y) ** 2,
  );

  // If we're close to the insertion point, then we need to change direction
  const insertionAngle = Math.atan2(insertionPointY - y, insertionPointX - x);

  const directionDifferenceRaw = (insertionAngle - direction);
  const diffSign = Math.sign(directionDifferenceRaw);

  // try to dampen the direction difference when it goes across the y axis and becomes nearly
  //  2PI radians away in the negative or positive direction
  const directionDifference = Math.abs(directionDifferenceRaw) > Math.PI ?
    directionDifferenceRaw - diffSign * 2 * Math.PI :
    directionDifferenceRaw;

  const top = (distanceToInsertionPoint - distanceToIntercept);
  const bottom = (1 + distanceToInsertionPoint);

  const ratio = top / bottom;

  // lol the 0.2 is a magic number to make up for the fact that we're angling directly toward the insertion point
  // It's basically our anti-gravity to stay closer to the oribtal plane until I get smarter
  const newDirection = ratio * directionDifference + direction - 0.2;


  return {
    ...box,
    direction: newDirection % (2 * Math.PI),
    insertionPointX,
    insertionPointY,
    interceptX,
    interceptY,
    offsetAngle,
    insertionAngle,
  };
});

export default enterOrbit;
