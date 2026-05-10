import { mockProperties, Property } from "../constants/mock/mock-properties";
import config from "../config/env";
import { PROPERTY } from "../constants/paths";
import {
  ApiResult,
  err,
  fetchGetJson,
  notFoundFailure,
  ok,
  type ApiFailure,
} from "../lib/api-result";

export interface PaginatedPropertiesResponse {
  data: Property[];
  total: number;
  page: number;
  totalPages: number;
}

/** Ensures all nested arrays/objects are never null/undefined. */
function normalizeProperty(p: any): Property {
  const rawMedia = Array.isArray(p?.media) ? p.media : [];
  return {
    ...p,
    media: rawMedia.map((m: any) => ({
      ...m,
      type: m?.type ? (String(m.type).toLowerCase() as "image" | "video") : "image",
    })),
    features: Array.isArray(p?.features) ? p.features : [],
    amenities: Array.isArray(p?.amenities) ? p.amenities : [],
    location: p?.location ?? { city: "", barangay: "", province: "", coordinates: null },
  } as Property;
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

const isMock = () => process.env.EXPO_PUBLIC_IS_MOCK === "true" || config.useMock;

/** API may send `data` as a single object or non-array; only map real arrays. */
function coercePropertyRows(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw;
  return [];
}

/**
 * Safe `data[]` from a successful paginated response (avoids `.map` on non-arrays in UI).
 */
export function propertyListFromPaginatedOk(
  page: PaginatedPropertiesResponse
): Property[] {
  const inner = page?.data;
  return Array.isArray(inner) ? inner : [];
}

/** Fetches a single page of properties. Used for infinite scroll. */
export async function getPropertiesPaginated(
  filters?: Record<string, any>,
  page = 1,
  limit = 12
): Promise<ApiResult<PaginatedPropertiesResponse>> {
  const emptyPage = (): PaginatedPropertiesResponse => ({
    data: [],
    total: 0,
    page,
    totalPages: 0,
  });

  if (isMock()) {
    const start = (page - 1) * limit;
    const paginated = mockProperties.slice(start, start + limit);
    return ok({
      data: paginated.map(normalizeProperty),
      total: mockProperties.length,
      page,
      totalPages: Math.ceil(mockProperties.length / limit),
    });
  }

  const params = { ...filters, page, limit };
  const url = PROPERTY.getProperties + buildQueryString(params);

  const res = await fetchGetJson<PaginatedPropertiesResponse | Property[]>(url);
  if (!res.ok) return res;

  const json = res.data;
  if (Array.isArray(json)) {
    if (json.length === 0 && page === 1) {
      return ok(emptyPage());
    }
    return ok({
      data: json.map(normalizeProperty),
      total: json.length,
      page: 1,
      totalPages: 1,
    });
  }

  const envelope = json as PaginatedPropertiesResponse;
  const data = coercePropertyRows(envelope.data).map(normalizeProperty);
  return ok({
    ...envelope,
    data,
    total: envelope.total ?? data.length,
    totalPages: envelope.totalPages ?? 0,
  });
}

/** Kept for backward compatibility (admin view fetches all at once). */
export async function getProperties(filters?: Record<string, any>): Promise<ApiResult<Property[]>> {
  if (isMock()) {
    return ok(mockProperties.map(normalizeProperty));
  }

  const url = PROPERTY.getProperties + buildQueryString({ ...filters, limit: 99 });
  const res = await fetchGetJson<PaginatedPropertiesResponse | Property[]>(url);
  if (!res.ok) return res;

  const json = res.data;
  if (Array.isArray(json)) {
    return ok(json.map(normalizeProperty));
  }
  return ok(coercePropertyRows((json as PaginatedPropertiesResponse).data).map(normalizeProperty));
}

export async function getPropertyById(id: string): Promise<ApiResult<Property>> {
  if (isMock()) {
    const p = mockProperties.find((x) => String(x.id) === String(id));
    return p ? ok(normalizeProperty(p)) : err(notFoundFailure());
  }

  const list = await getProperties();
  if (!list.ok) return list;

  const found = list.data.find((p) => String(p.id) === String(id));
  if (!found) return err(notFoundFailure());
  return ok(found);
}

export async function getPropertyBounds(): Promise<
  ApiResult<{ maxPrice: number; maxLotArea: number }>
> {
  const fallback = { maxPrice: 50000000, maxLotArea: 1000 };

  if (isMock()) {
    return ok(fallback);
  }

  const res = await fetchGetJson<{ maxPrice: number; maxLotArea: number }>(PROPERTY.getBounds);
  if (!res.ok) {
    return res;
  }
  return ok({
    maxPrice: Number(res.data.maxPrice) || fallback.maxPrice,
    maxLotArea: Number(res.data.maxLotArea) || fallback.maxLotArea,
  });
}

/** Returns a map of { cityName: count } for all cities that have at least one property. */
export async function getCityPropertyCounts(): Promise<ApiResult<Record<string, number>>> {
  if (isMock()) {
    const counts: Record<string, number> = {};
    for (const p of mockProperties) {
      const city = p.location?.city;
      if (city) counts[city] = (counts[city] ?? 0) + 1;
    }
    return ok(counts);
  }

  const res = await fetchGetJson<unknown>(PROPERTY.getCityCounts);
  if (!res.ok) return res;

  const json = res.data;
  if (Array.isArray(json)) {
    const map: Record<string, number> = {};
    for (const item of json as { city?: string; count?: number }[]) {
      if (item.city && typeof item.count === "number") {
        map[item.city] = item.count;
      }
    }
    return ok(map);
  }
  if (json && typeof json === "object") {
    return ok(json as Record<string, number>);
  }
  return ok({});
}

/** Re-export for screens that branch on failure codes without importing api-result. */
export type { ApiFailure, ApiResult };

/** Not a screen — satisfies Expo Router when this module sits under `app/`. */
export default function PropertyServiceRouteStub(): null {
  return null;
}
