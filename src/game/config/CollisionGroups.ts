// Assign things to groups so that we can easily enable/disable collisions between different groups
export const CollisionGroups = {
  None: 0,
  Environment: 0b1,
  Player: 0b10,
  Enemies: 0b100,
  All: 0b11111111111111111111111111111111,
};
