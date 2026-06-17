import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SeoHead from "../lib/SeoHead";
import {
  propertyDetailPath,
  propertyListingJsonLd,
  propertySeoDescription,
} from "../constants/seo";
import { Property } from "../constants/mock/mock-properties";
import { DataFetchState } from "../modules/generics/components/DataFetchState";
import PropertyDetailsContent from "../modules/details-view/components/propertyDetailsContent";
import { PropertyDetailsSkeleton } from "../modules/details-view/components/PropertyDetailsSkeleton";
import { getPropertyById, type ApiFailure } from "../service/property-service";

// Guaranteed shell so any id (incl. properties added after the last build) can
// be opened directly / shared without 404ing. Vercel rewrites unknown
// `/details/:id` paths to this exported file, which then resolves the real id
// from the URL and fetches client-side. See vercel.json.
export const DETAILS_FALLBACK_ID = "_fallback";

export async function generateStaticParams(): Promise<{ id: string }[]> {
  const fallback = { id: DETAILS_FALLBACK_ID };

  if (process.env.EXPO_PUBLIC_IS_MOCK === "true") {
    const { mockProperties } = await import("../constants/mock/mock-properties");
    return [...mockProperties.map((p) => ({ id: String(p.id) })), fallback];
  }

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) return [fallback];

  try {
    const res = await fetch(`${apiUrl}/property/getAll?limit=500`);
    if (!res.ok) return [fallback];
    const json = await res.json();
    const rows = Array.isArray(json) ? json : (json?.data ?? []);
    return [
      ...rows
        .filter((p: { id?: number }) => p?.id != null)
        .map((p: { id: number }) => ({ id: String(p.id) })),
      fallback,
    ];
  } catch {
    return [fallback];
  }
}

export default function PropertyDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<ApiFailure | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    setFetchError(null);
    setNotFound(false);
    const fetched = await getPropertyById(id);
    if (!fetched.ok) {
      if (fetched.error.code === "not_found") {
        setNotFound(true);
        setProperty(null);
      } else {
        setFetchError(fetched.error);
        setProperty(null);
      }
    } else {
      setProperty(fetched.data);
    }
    setLoading(false);
  }, [id, retryKey]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setRetryKey((k) => k + 1);
  }, []);

  const primaryImage =
    property?.media?.find((m) => m.isPrimary)?.url ?? property?.media?.[0]?.url;

  if (loading) {
    return (
      <>
        <SeoHead
          title="Property Details"
          description="Loading property listing details in Ilocos Sur."
          path={id ? propertyDetailPath(id) : undefined}
          noIndex
        />
        <SafeAreaView className="flex-1 bg-white">
          <PropertyDetailsSkeleton />
        </SafeAreaView>
      </>
    );
  }

  if (fetchError) {
    return (
      <>
        <SeoHead title="Listing Unavailable" noIndex />
        <SafeAreaView className="flex-1 bg-gray-100">
          <DataFetchState
            variant={fetchError.code === "offline" ? "offline" : "error"}
            title={
              fetchError.code === "offline"
                ? "You’re offline"
                : "Couldn’t load this listing"
            }
            message={fetchError.message}
            onRetry={retry}
            retryLabel="Try again"
          />
        </SafeAreaView>
      </>
    );
  }

  if (notFound || !property) {
    return (
      <>
        <SeoHead title="Property Not Found" noIndex />
        <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center px-6">
          <DataFetchState
            variant="empty"
            title="Property not found"
            message="This listing isn’t available or may have been removed."
          />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={property.title}
        description={propertySeoDescription(property)}
        path={propertyDetailPath(property.id)}
        image={primaryImage}
        type="product"
        jsonLd={propertyListingJsonLd(property)}
      />
      <SafeAreaView className="flex-1 bg-white items-center w-full">
        <View className="flex-1 w-full mx-auto">
          <PropertyDetailsContent property={property} />
        </View>
      </SafeAreaView>
    </>
  );
}
