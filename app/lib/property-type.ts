export const PROPERTY_TYPES = ["LOT", "HOUSE_AND_LOT", "CONDO", "COMMERCIAL"] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeValue, string> = {
  LOT: "Lot",
  HOUSE_AND_LOT: "House & Lot",
  CONDO: "Condo",
  COMMERCIAL: "Commercial",
};

export function normalizePropertyTypeKey(type: string | null | undefined): string {
  if (!type) return "";
  const key = type.toUpperCase().replace(/-/g, "_");
  return key === "HOUSE" ? "HOUSE_AND_LOT" : key;
}

export function formatPropertyType(type: string | null | undefined): string {
  const key = normalizePropertyTypeKey(type) as PropertyTypeValue;
  return PROPERTY_TYPE_LABELS[key] ?? type ?? "Property";
}

export function isHouseAndLotType(type: string | null | undefined): boolean {
  return normalizePropertyTypeKey(type) === "HOUSE_AND_LOT";
}

export function propertyTypeMatches(
  propertyType: string | null | undefined,
  filterType: string
): boolean {
  return normalizePropertyTypeKey(propertyType) === normalizePropertyTypeKey(filterType);
}
