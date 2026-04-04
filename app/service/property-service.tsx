import { mockProperties, Property } from "../constants/mock/mock-properties"
import config from "../config/env"
import { PROPERTY } from "../constants/paths"


export async function getProperties(filters?: Record<string, any>): Promise<Property[]> {
   try{
      let url = PROPERTY.getProperties;
      if (filters) {
          const queryParams = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== '') {
                  if (Array.isArray(value)) {
                      if (value.length > 0) queryParams.append(key, value.join(','));
                  } else {
                      queryParams.append(key, String(value));
                  }
              }
          });
          const queryString = queryParams.toString();
          if (queryString) {
              url += `?${queryString}`;
          }
      }
      console.log("getProperties URL:", url)
    const response = await fetch(url)
    console.log("RESPONSE", response.status)
    if(!response.ok){
      return []
    }
    
    let properties: Property[] = await response.json();

   return properties ? properties: []
   }
   catch(e){
     console.log("Error Fetching Properties: ", e)
    return []
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
    console.log("Error Fetching Property: ", e);
    return null;
  }
}

export async function getPropertyBounds(): Promise<{maxPrice: number, maxLotArea: number}> {
  if (process.env.EXPO_PUBLIC_IS_MOCK === "true" || config.useMock) {
      return { maxPrice: 50000000, maxLotArea: 1000 };
  }
  try {
      const res = await fetch(PROPERTY.getBounds);
      if (res.ok) {
          return await res.json();
      }
      return { maxPrice: 50000000, maxLotArea: 1000 };
  } catch (e) {
      return { maxPrice: 50000000, maxLotArea: 1000 };
  }
}