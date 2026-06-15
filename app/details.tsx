import { Redirect, useLocalSearchParams } from "expo-router";
import { propertyDetailPath } from "./constants/seo";

/** Legacy `/details?id=` URLs redirect to SEO-friendly `/details/[id]` paths. */
export default function DetailsLegacyRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return <Redirect href="/properties" />;
  }

  return <Redirect href={propertyDetailPath(id)} />;
}
