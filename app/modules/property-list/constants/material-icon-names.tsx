export type MaterialIconName =
  | "road"
  | "hospital"
  | "school"
  | "store"
  | "parking"
  | "beach"
  | "shopping"
  | "help-circle";


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
// This type includes all possible icon values that could be used in features
export type FeatureIconName = MaterialIconName;