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
  | "dots-horizontal";

export const MATERIAL_ICON_NAMES = [
  "road",
  "hospital",
  "school",
  "store",
  "parking",
  "beach",
  "shopping",
  "help-circle",
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
