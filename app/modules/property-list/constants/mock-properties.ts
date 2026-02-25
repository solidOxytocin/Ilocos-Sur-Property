// Define the Property type
export interface Feature {
  name: string;
  icon: string;
}
export type Property = {
  id: string;
  city: string;
  barangay: string;
  address: string;
  photo: string;
  price: string;
  features: Feature[];
  sqm?: number;
};

// Mock data for properties
export const mockProperties: Property[] = [
  {
    id: "1",
    city: "Vigan City",
    barangay: "Pantay Daya",
    address: "123 Main St, City",
    photo:
      "https://media.istockphoto.com/id/2155879454/photo/this-is-an-exterior-photo-of-a-home-for-sale-in-beverly-hills-ca.jpg?s=612x612&w=0&k=20&c=uSKacMQvmaYX5Pf5Br7pUfErYQbNt_UWXRTjfwrdSDQ=",
    price: "$250,000",
    features: [
      { name: "Main Road", icon: "road" },
      { name: " Hospital", icon: "hospital" },
    ],
    sqm: 1500,
  },
  {
    id: "2",
    city: "San Vicente",
    barangay: "Barangay I - Amianance",
    address: "456 Oak Ave, San",
    photo:
      "https://agentrealestateschools.com/wp-content/uploads/2021/11/real-estate-property.jpg",
    price: "$320,000",
    features: [
      { name: " Main Road", icon: "road" },
      { name: " School", icon: "school" },
      { name: " Hospital", icon: "hospital" },
    ],
    sqm: 1800,
  },
  {
    id: "3",
    city: "Vigan City",
    barangay: "Barangay IV",
    address: "789 Pine Rd, Village",
    photo:
      "https://prod.rockmedialibrary.com/api/public/content/ff061825fa8e44bf8108de5c786c0062?v=4c4f7c7a",
    price: "$180,000",
    features: [
      { name: " Market", icon: "store" },
      { name: " University", icon: "school" },
      { name: " Hospital", icon: "hospital" },
      { name: " Main Road", icon: "road" },
    ],
    sqm: 1200,
  },
  {
    id: "4",
    city: "Vigan City",
    barangay: "Barangay I",
    address: "321 Elm St, Borough",
    photo:
      "https://media.istockphoto.com/id/2155879454/photo/this-is-an-exterior-photo-of-a-home-for-sale-in-beverly-hills-ca.jpg?s=612x612&w=0&k=20&c=uSKacMQvmaYX5Pf5Br7pUfErYQbNt_UWXRTjfwrdSDQ=",
    price: "$450,000",
    features: [{ name: " Parking", icon: "parking" }],
    sqm: 1400,
  },
  {
    id: "5",
    city: "Bantay",
    barangay: "Barangay III",
    address: "654 Maple Dr, County",
    photo: "https://placehold.co/300x200",
    price: "$275,000",
    features: [
      { name: " Tourist Spot", icon: "beach" },
      { name: " Market", icon: "store" },
      { name: " University", icon: "school" },
      { name: " Hospital", icon: "hospital" },
      { name: " Main Road", icon: "road" },
    ],
    sqm: 1600,
  },
  {
    id: "6",
    city: "Magsingal",
    barangay: "Bayubay",
    address: "987 Cedar Ln, District",
    photo: "https://placehold.co/300x200",
    price: "$380,000",
    features: [{ name: " Mall", icon: "shopping" }],
    sqm: 2700,
  },
];
