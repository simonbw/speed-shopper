// Assign things to groups so that we can easily enable/disable collisions between different groups

import { makeCollisionGroups } from "../core/util/CollisionGroupUtils";
import { objectKeys } from "../core/util/ObjectUtils";

export const CollisionGroups = makeCollisionGroups([
  "Environment",
  "Player",
  "CartExterior",
  "CartInterior",
  "FreeMerchandise",
  "CartedMerchandise",
  "Checkout",
] as const);

export type CollisionGroupName = keyof typeof CollisionGroups;

const groupNames = objectKeys(CollisionGroups).filter((name) => name !== "All");

export function collisionGroupToNames(group: number): CollisionGroupName[] {
  if (group === CollisionGroups.All) {
    return ["All"];
  }
  return groupNames.filter((name) => group & CollisionGroups[name]);
}

export function collisionGroupsToNumber(
  groups: ReadonlyArray<CollisionGroupName>
): number {
  return groups.reduce<number>(
    (acc, group) => acc | CollisionGroups[group],
    CollisionGroups.None
  );
}
