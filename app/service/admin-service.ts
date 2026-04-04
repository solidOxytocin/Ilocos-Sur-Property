import { ADMIN } from "../constants/paths";
import { Property } from "../constants/mock/mock-properties";

export async function createProperty(data: Partial<Property>): Promise<Property | null> {
  try {
    const response = await fetch(ADMIN.createProperty, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
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
