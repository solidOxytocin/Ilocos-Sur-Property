import { mockProperties, Property } from "../constants/mock/mock-properties"
import config from "../config/env"


export async function getProperties(): Promise<Property[]> {
   try{
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