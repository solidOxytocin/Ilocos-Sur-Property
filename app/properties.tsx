import { useEffect } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import PropertyList from "./(tabs)/index";

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

  return <PropertyList />;
}
