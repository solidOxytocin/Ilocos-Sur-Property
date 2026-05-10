export const EMPTY_ICON_KEY = "empty";
export const MORE_ICON_KEY = "more";

export type MaterialIconName =
  | "road"
  | "hospital"
  | "school"
  | "store"
  | "parking"
  | "beach"
  | "shopping"
  | "help-circle"
  | "dots-horizontal"
  | "pool"
  | "dumbbell"
  | "security"
  | "elevator"
  | "home-city"
  | "check-circle"
  | "bed-empty"
  | "shower"
  | "car"
  | "texture-box"
  | "floor-plan";

export const MATERIAL_ICON_NAMES = [
  "road",
  "hospital",
  "school",
  "store",
  "parking",
  "beach",
  "shopping",
  "help-circle",
  "pool",
  "dumbbell",
  "security",
  "elevator",
  "home-city",
  "check-circle",
  "bed-empty",
  "shower",
  "car",
  "texture-box",
  "floor-plan",
] as const;

export const FEATURE_ICONS: Record<string, MaterialIconName> = {
  road: "road",
  hospital: "hospital",
  school: "school",
  store: "store",
  parking: "parking",
  beach: "beach",
  shopping: "shopping",
  empty: "help-circle",
  more: "dots-horizontal",
};

export const AMENITY_ICONS: Record<string, MaterialIconName> = {
  pool: "pool",
  gym: "dumbbell",
  security: "security",
  elevator: "elevator",
  empty: "help-circle",
  more: "dots-horizontal",
};

/** Not a screen — satisfies Expo Router when this module sits under `app/`. */
export default function MaterialIconNamesRouteStub(): null {
  return null;
}
