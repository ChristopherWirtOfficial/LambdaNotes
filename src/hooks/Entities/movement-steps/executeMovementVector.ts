import { Moveable, MovementStep } from 'types/Boxes';


// Step the box in the direction it is moving at the speed it is moving
const executeMovementVector: MovementStep<Moveable> = box => {
  const { x, y, direction, speed } = box;

  const newX = x + Math.cos(direction) * speed;
  const newY = y + Math.sin(direction) * speed;

  return {
    ...box,
    x: newX,
    y: newY,
  };
};

export default executeMovementVector;
