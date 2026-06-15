import { useEffect } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import SeoHead from "./lib/SeoHead";
import { organizationJsonLd, SITE, websiteJsonLd } from "./constants/seo";
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

  return (
    <>
      <SeoHead
        description={SITE.description}
        path="/"
        jsonLd={[organizationJsonLd(), websiteJsonLd()]}
      />
      <LandingPage />
    </>
  );
}
