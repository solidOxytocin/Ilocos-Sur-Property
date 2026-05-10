import { Platform } from "react-native";
import { ADMIN } from "../constants/paths";
import { Property } from "../constants/mock/mock-properties";
import {
  ApiFailure,
  ApiResult,
  API_USER_MESSAGES,
  err,
  fetchMutationJson,
  fetchMutationOk,
  ok,
} from "../lib/api-result";

export type UploadedMediaItem = { url: string; cloudinaryPublicId: string };
type AdminLoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  expiresAt: string | null;
};
type AdminAuthListener = (authed: boolean) => void;

const ADMIN_TOKEN_STORAGE_KEY = "admin_access_token";
let adminTokenCache: string | null = null;
const authListeners = new Set<AdminAuthListener>();

function loginErrorFromFailure(status?: number): ApiFailure {
  if (status === 401 || status === 403) {
    return {
      code: status === 401 ? "unauthorized" : "forbidden",
      message: "Invalid username or password.",
      status,
      retryable: false,
    };
  }
  return {
    code: "http",
    message: API_USER_MESSAGES.http,
    status,
    retryable: true,
  };
}

function notifyAuthChange(): void {
  const authed = Boolean(adminTokenCache);
  authListeners.forEach((listener) => listener(authed));
}

function getStorage(): Storage | null {
  if (Platform.OS !== "web") return null;
  if (typeof globalThis === "undefined") return null;
  return globalThis.localStorage ?? null;
}

function persistToken(token: string | null): void {
  const storage = getStorage();
  if (!storage) return;

  if (!token) {
    storage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    return;
  }

  storage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
}

function getCachedToken(): string | null {
  if (adminTokenCache) return adminTokenCache;
  const storage = getStorage();
  if (!storage) return null;
  const fromStorage = storage.getItem(ADMIN_TOKEN_STORAGE_KEY)?.trim();
  adminTokenCache = fromStorage || null;
  return adminTokenCache;
}

export async function initializeAdminAuth(): Promise<boolean> {
  getCachedToken();
  return Boolean(adminTokenCache);
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getCachedToken());
}

export function clearAdminAuth(): void {
  adminTokenCache = null;
  persistToken(null);
  notifyAuthChange();
}

export function subscribeAdminAuth(listener: AdminAuthListener): () => void {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

export type LoginResult = ApiResult<{ token: string }>;

export async function loginAdmin(username: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch(ADMIN.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    });

    if (!response.ok) {
      clearAdminAuth();
      return err(loginErrorFromFailure(response.status));
    }

    const json = (await response.json()) as Partial<AdminLoginResponse>;
    const token = json.accessToken?.trim();
    if (!token) {
      clearAdminAuth();
      return err({
        code: "empty_body",
        message: API_USER_MESSAGES.emptyBody,
        retryable: true,
      });
    }

    adminTokenCache = token;
    persistToken(token);
    notifyAuthChange();
    return ok({ token });
  } catch {
    clearAdminAuth();
    return err({
      code: "network",
      message: API_USER_MESSAGES.network,
      retryable: true,
    });
  }
}

function getAdminAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getCachedToken();
  if (!token) {
    return { ...extra };
  }
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}

export type UploadMediaResult = ApiResult<UploadedMediaItem[]>;

/** Uploads one or more images to the API (Cloudinary). Each file max 10MB (enforced server-side). */
export async function uploadPropertyImages(
  assets: { uri: string; name?: string | null; mimeType?: string | null }[]
): Promise<UploadMediaResult> {
  if (!assets.length) return ok([]);

  try {
    const formData = new FormData();
    for (const a of assets) {
      const name = a.name || "image.jpg";
      const type = a.mimeType || "image/jpeg";
      if (Platform.OS === "web") {
        const blob = await fetch(a.uri).then((r) => r.blob());
        formData.append("images", blob, name);
      } else {
        formData.append("images", { uri: a.uri, name, type } as any);
      }
    }
    const res = await fetch(ADMIN.uploadMedia, {
      method: "POST",
      headers: getAdminAuthHeaders(),
      body: formData,
    });

    if (res.status === 401 || res.status === 403) {
      clearAdminAuth();
      return err({
        code: res.status === 401 ? "unauthorized" : "forbidden",
        message: API_USER_MESSAGES.unauthorized,
        status: res.status,
        retryable: false,
      });
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const msg =
        json && typeof json === "object" && "message" in json && typeof (json as any).message === "string"
          ? String((json as any).message)
          : "Upload failed. Check image size and format.";
      return err({
        code: "server",
        message: msg,
        status: res.status,
        retryable: res.status >= 500,
      });
    }

    const items = (json as { items?: UploadedMediaItem[] })?.items ?? null;
    if (!items || !Array.isArray(items)) {
      return err({
        code: "empty_body",
        message: API_USER_MESSAGES.emptyBody,
        retryable: true,
      });
    }

    return ok(items);
  } catch {
    return err({
      code: "network",
      message: API_USER_MESSAGES.network,
      retryable: true,
    });
  }
}

export type PropertyMutationResult = ApiResult<Property>;

export async function createProperty(data: Partial<Property>): Promise<PropertyMutationResult> {
  return fetchMutationJson<Property>(ADMIN.createProperty, {
    method: "POST",
    headers: getAdminAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then((r) => {
    if (!r.ok && (r.error.status === 401 || r.error.status === 403)) clearAdminAuth();
    return r;
  });
}

export async function updateProperty(id: string | number, data: Partial<Property>): Promise<PropertyMutationResult> {
  return fetchMutationJson<Property>(ADMIN.updateProperty(id), {
    method: "PUT",
    headers: getAdminAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(data),
  }).then((r) => {
    if (!r.ok && (r.error.status === 401 || r.error.status === 403)) clearAdminAuth();
    return r;
  });
}

export type DeleteResult = ApiResult<void>;

export async function deleteProperty(id: string | number): Promise<DeleteResult> {
  return fetchMutationOk(ADMIN.deleteProperty(id), {
    method: "DELETE",
    headers: getAdminAuthHeaders(),
  }).then((r) => {
    if (!r.ok && (r.error.status === 401 || r.error.status === 403)) clearAdminAuth();
    return r;
  });
}

export async function deleteManyProperties(ids: (string | number)[]): Promise<DeleteResult> {
  return fetchMutationOk(ADMIN.deleteManyProperties, {
    method: "POST",
    headers: getAdminAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ ids }),
  }).then((r) => {
    if (!r.ok && (r.error.status === 401 || r.error.status === 403)) clearAdminAuth();
    return r;
  });
}

export type { ApiFailure, ApiResult };

/** Not a screen — satisfies Expo Router when this module sits under `app/`. */
export default function AdminServiceRouteStub(): null {
  return null;
}
