// Assign things to groups so that we can easily enable/disable collisions between different groups
export const CollisionGroups = {
  None: 0,
  Environment: 1,
  Player: 1 << 1,
  CartExterior: 1 << 2,
  CartInterior: 1 << 3,
  FreeMerchandise: 1 << 4,
  CartedMerchandise: 1 << 5,
  All: 0b11111111111111111111111111111111,
} as const;
