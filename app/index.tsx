import { useEffect } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import LandingPage from "./modules/landing/LandingPage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== "web") {
      router.replace("/(tabs)");
    }
  }, []);

  if (Platform.OS !== "web") {
    return null;
  }

  return <LandingPage />;
}
