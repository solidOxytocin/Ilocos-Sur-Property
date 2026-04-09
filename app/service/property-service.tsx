import { mockProperties, Property } from "../constants/mock/mock-properties"
import config from "../config/env"
import { PROPERTY } from "../constants/paths"

export interface PaginatedPropertiesResponse {
  data: Property[];
  total: number;
  page: number;
  totalPages: number;
}

function buildQueryString(filters?: Record<string, any>): string {
  if (!filters) return "";
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        if (value.length > 0) queryParams.append(key, value.join(","));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : "";
}

/** Fetches a single page of properties. Used for infinite scroll. */
export async function getPropertiesPaginated(
  filters?: Record<string, any>,
  page = 1,
  limit = 12
): Promise<PaginatedPropertiesResponse> {
  const empty: PaginatedPropertiesResponse = { data: [], total: 0, page, totalPages: 0 };
  try {
    const params = { ...filters, page, limit };
    const url = PROPERTY.getProperties + buildQueryString(params);
    console.log("getPropertiesPaginated URL:", url);
    const response = await fetch(url);
    if (!response.ok) return empty;
    const json = await response.json();
    // Support both old array response and new paginated envelope
    if (Array.isArray(json)) {
      return { data: json, total: json.length, page: 1, totalPages: 1 };
    }
    return json as PaginatedPropertiesResponse;
  } catch (e) {
    console.log("Error Fetching Properties (paginated):", e);
    return empty;
  }
}

/** Kept for backward compatibility (admin view fetches all at once). */
export async function getProperties(filters?: Record<string, any>): Promise<Property[]> {
  try {
    const url = PROPERTY.getProperties + buildQueryString({ ...filters, limit: 1000 });
    console.log("getProperties URL:", url);
    const response = await fetch(url);
    if (!response.ok) return [];
    const json = await response.json();
    if (Array.isArray(json)) return json;
    return (json as PaginatedPropertiesResponse).data ?? [];
  } catch (e) {
    console.log("Error Fetching Properties:", e);
    return [];
  }
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (process.env.EXPO_PUBLIC_IS_MOCK === "true" || config.useMock) {
    return mockProperties.find(p => p.id === Number(id)) || null;
  }
  try {
    const properties = await getProperties();
    return properties.find(p => p.id === Number(id)) || null;
  } catch (e) {
    console.log("Error Fetching Property:", e);
    return null;
  }
}

export async function getPropertyBounds(): Promise<{ maxPrice: number; maxLotArea: number }> {
  if (process.env.EXPO_PUBLIC_IS_MOCK === "true" || config.useMock) {
    return { maxPrice: 50000000, maxLotArea: 1000 };
  }
  try {
    const res = await fetch(PROPERTY.getBounds);
    if (res.ok) return await res.json();
    return { maxPrice: 50000000, maxLotArea: 1000 };
  } catch (e) {
    return { maxPrice: 50000000, maxLotArea: 1000 };
  }
}