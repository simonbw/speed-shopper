import { ContactMaterial, Material } from "p2";
import { objectEntries } from "../../core/util/ObjectUtils";

export const Materials = {
  wall: new Material(),
  player: new Material(),
} as const;

const MaterialToName: { [id: number]: keyof typeof Materials } =
  Object.fromEntries(
    objectEntries(Materials).map(([name, material]) => [material.id, name])
  );

export function getMaterialName(material: Material): string {
  return MaterialToName[material.id];
}

// TODO: Make an editor for this
export const ContactMaterials: ReadonlyArray<ContactMaterial> = [
  new ContactMaterial(Materials.wall, Materials.player),
];
