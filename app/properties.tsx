import { useEffect } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import SeoHead from "./lib/SeoHead";
import PropertyList from "./(tabs)/properties";

/**
 * Web: renders the full property list at the clean URL /properties.
 * Mobile: immediately redirects to the native tab navigator.
 */
export default function PropertiesPage() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "web") {
      router.replace("/(tabs)");
    }
  }, []);

  if (Platform.OS !== "web") return null;

  return (
    <>
      <SeoHead
        title="Browse Properties"
        description="Search and filter houses, lots, condos, and commercial listings across Ilocos Sur. Filter by city, price, type, and amenities."
        path="/properties"
      />
      <PropertyList />
    </>
  );
}
