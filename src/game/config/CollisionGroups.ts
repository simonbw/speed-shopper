import { objectEntries, objectKeys } from "../../core/util/ObjectUtils";

// Assign things to groups so that we can easily enable/disable collisions between different groups

let i = 0;
const makeGroup = () => 1 << i++;

export const CollisionGroupsWithoutAll = {
  None: 0,
  Environment: makeGroup(),
  Player: makeGroup(),
  CartExterior: makeGroup(),
  CartInterior: makeGroup(),
  FreeMerchandise: makeGroup(),
  CartedMerchandise: makeGroup(),
  Checkout: makeGroup(),
} as const;

export type CollisionGroupName = keyof typeof CollisionGroupsWithoutAll | "All";

export const CollisionGroups: Record<CollisionGroupName, number> = {
  ...CollisionGroupsWithoutAll,
  All: Object.values(CollisionGroupsWithoutAll).reduce(
    (acc, group) => acc | group,
    0
  ),
};

export function collisionGroupsToNumber(
  groups: ReadonlyArray<CollisionGroupName>
): number {
  return groups.reduce<number>(
    (acc, group) => acc | CollisionGroups[group],
    CollisionGroups.None
  );
}

const groupNames = objectKeys(CollisionGroups).filter((name) => name !== "All");
export function collisionGroupToNames(group: number): CollisionGroupName[] {
  if (group === CollisionGroups.All) {
    return ["All"];
  }
  return groupNames.filter((name) => group & CollisionGroups[name]);
}
