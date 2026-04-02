import { mockProperties, Property } from "../constants/mock/mock-properties"
import config from "../config/env"
import { PROPERTY } from "../constants/paths"


export async function getProperties(): Promise<Property[]> {
   try{
      console.log("getProperties")
    const response = await fetch(PROPERTY.getProperties)
    console.log("RESPONSE", response)
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