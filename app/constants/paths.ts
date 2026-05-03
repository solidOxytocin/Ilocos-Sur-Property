
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL

export const PROPERTY = {
  getProperties: `${BASE_URL}/property/getAll`,
  getBounds: `${BASE_URL}/property/bounds`,
  getCityCounts: `${BASE_URL}/property/city-counts`,
};

export const ADMIN = {
  createProperty: `${BASE_URL}/admin/property`,
  updateProperty: (id: string | number) => `${BASE_URL}/admin/property/${id}`,
  deleteProperty: (id: string | number) => `${BASE_URL}/admin/property/${id}`,
  deleteManyProperties: `${BASE_URL}/admin/property/delete-many`,
  uploadMedia: `${BASE_URL}/admin/media/upload`,
};

// Dummy export to prevent Expo Router from complaining about missing default export
export default function PathsIgnored() { return null; }