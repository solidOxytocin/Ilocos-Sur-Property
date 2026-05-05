import { Platform } from "react-native";
import { ADMIN } from "../constants/paths";
import { Property } from "../constants/mock/mock-properties";

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

export async function loginAdmin(username: string, password: string): Promise<boolean> {
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
      return false;
    }

    const json = (await response.json()) as Partial<AdminLoginResponse>;
    const token = json.accessToken?.trim();
    if (!token) {
      clearAdminAuth();
      return false;
    }

    adminTokenCache = token;
    persistToken(token);
    notifyAuthChange();
    return true;
  } catch (error) {
    console.error("loginAdmin error:", error);
    clearAdminAuth();
    return false;
  }
}

function getAdminAuthHeaders(
  extra?: Record<string, string>
): Record<string, string> {
  const token = getCachedToken();
  if (!token) {
    return { ...extra };
  }
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}

/** Uploads one or more images to the API (Cloudinary). Each file max 10MB (enforced server-side). */
export async function uploadPropertyImages(
  assets: { uri: string; name?: string | null; mimeType?: string | null }[]
): Promise<UploadedMediaItem[] | null> {
  if (!assets.length) return [];
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
    const response = await fetch(ADMIN.uploadMedia, {
      method: "POST",
      headers: getAdminAuthHeaders(),
      body: formData,
    });
    if (response.status === 401 || response.status === 403) {
      clearAdminAuth();
      return null;
    }
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("uploadPropertyImages failed:", err);
      return null;
    }
    const json = (await response.json()) as { items?: UploadedMediaItem[] };
    return json.items ?? null;
  } catch (e) {
    console.error("uploadPropertyImages error:", e);
    return null;
  }
}

export async function createProperty(data: Partial<Property>): Promise<Property | null> {
  try {
    const response = await fetch(ADMIN.createProperty, {
      method: "POST",
      headers: getAdminAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });
    
    if (response.status === 401 || response.status === 403) {
        clearAdminAuth();
        return null;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to create property:", errorData);
        return null;
    }
    return await response.json();
  } catch (e) {
    console.error("Error calling createProperty:", e);
    return null;
  }
}

export async function updateProperty(id: string | number, data: Partial<Property>): Promise<Property | null> {
  try {
    const response = await fetch(ADMIN.updateProperty(id), {
      method: "PUT",
      headers: getAdminAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });

    if (response.status === 401 || response.status === 403) {
        clearAdminAuth();
        return null;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to update property:", errorData);
        return null;
    }
    return await response.json();
  } catch (e) {
    console.error("Error calling updateProperty:", e);
    return null;
  }
}

export async function deleteProperty(id: string | number): Promise<boolean> {
  try {
    const response = await fetch(ADMIN.deleteProperty(id), {
      method: "DELETE",
      headers: getAdminAuthHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
        clearAdminAuth();
        return false;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to delete property:", errorData);
        return false;
    }
    return true;
  } catch (e) {
    console.error("Error calling deleteProperty:", e);
    return false;
  }
}

export async function deleteManyProperties(ids: (string | number)[]): Promise<boolean> {
  try {
    const response = await fetch(ADMIN.deleteManyProperties, {
      method: "POST",
      headers: getAdminAuthHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ ids }),
    });

    if (response.status === 401 || response.status === 403) {
        clearAdminAuth();
        return false;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to delete many properties:", errorData);
        return false;
    }
    return true;
  } catch (e) {
    console.error("Error calling deleteManyProperties:", e);
    return false;
  }
}
