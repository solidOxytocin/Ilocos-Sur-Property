import { Platform } from "react-native";
import { ADMIN } from "../constants/paths";
import { Property } from "../constants/mock/mock-properties";

export type UploadedMediaItem = { url: string; cloudinaryPublicId: string };

function getAdminAuthHeaders(
  extra?: Record<string, string>
): Record<string, string> {
  const token = process.env.EXPO_PUBLIC_ADMIN_TOKEN?.trim();
  if (!token) {
    if (__DEV__) {
      console.warn(
        "EXPO_PUBLIC_ADMIN_TOKEN is not set — admin API requests will return 401."
      );
    }
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
