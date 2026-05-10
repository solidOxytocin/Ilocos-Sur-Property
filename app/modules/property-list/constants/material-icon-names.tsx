export const EMPTY_ICON_KEY = "empty";
export const MORE_ICON_KEY = "more";

export type MaterialIconName =
  // ── Nearby Features ────────────────────────────────────────────────────
  | "road-variant"
  | "hospital-building"
  | "school"
  | "store"
  | "parking"
  | "beach"
  | "shopping"
  | "church"
  | "bus-stop"
  | "nature-people"
  | "food-fork-drink"
  | "gas-station"
  | "gate"
  | "wifi"
  | "image-filter-hdr"
  | "bridge"
  // ── Amenities ──────────────────────────────────────────────────────────
  | "pool"
  | "dumbbell"
  | "shield-check"
  | "elevator"
  | "cctv"
  | "water-pump"
  | "solar-power"
  | "flower"
  | "balcony"
  | "car-brake-parking"
  // ── UI / Generic ───────────────────────────────────────────────────────
  | "help-circle"
  | "dots-horizontal"
  | "home-city"
  | "check-circle"
  | "bed-empty"
  | "shower"
  | "car"
  | "texture-box"
  | "floor-plan";

export const MATERIAL_ICON_NAMES = [
  // Nearby features
  "road-variant",
  "hospital-building",
  "school",
  "store",
  "parking",
  "beach",
  "shopping",
  "church",
  "bus-stop",
  "nature-people",
  "food-fork-drink",
  "gas-station",
  "gate",
  "wifi",
  "image-filter-hdr",
  "bridge",
  // Amenities
  "pool",
  "dumbbell",
  "shield-check",
  "elevator",
  "cctv",
  "water-pump",
  "solar-power",
  "flower",
  "balcony",
  "car-brake-parking",
  // UI / Generic
  "help-circle",
  "dots-horizontal",
  "home-city",
  "check-circle",
  "bed-empty",
  "shower",
  "car",
  "texture-box",
  "floor-plan",
] as const;

export const FEATURE_ICONS: Record<string, MaterialIconName> = {
  // original
  road:        "road-variant",
  hospital:    "hospital-building",
  school:      "school",
  store:       "store",
  parking:     "parking",
  beach:       "beach",
  shopping:    "shopping",
  // new
  church:      "church",
  transport:   "bus-stop",
  nature:      "nature-people",
  restaurant:  "food-fork-drink",
  gas_station: "gas-station",
  gated:       "gate",
  wifi:        "wifi",
  mountain:    "image-filter-hdr",
  // fallbacks
  empty:       "help-circle",
  more:        "dots-horizontal",
};

export const AMENITY_ICONS: Record<string, MaterialIconName> = {
  // original
  pool:            "pool",
  gym:             "dumbbell",
  security:        "shield-check",
  elevator:        "elevator",
  // new
  cctv:            "cctv",
  water:           "water-pump",
  solar:           "solar-power",
  garden:          "flower",
  balcony:         "balcony",
  covered_parking: "car-brake-parking",
  // fallbacks
  empty:           "help-circle",
  more:            "dots-horizontal",
};

/** Not a screen — satisfies Expo Router when this module sits under `app/`. */
export default function MaterialIconNamesRouteStub(): null {
  return null;
}
