import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPropertyById, type ApiFailure } from "./service/property-service";
import { Property } from "./constants/mock/mock-properties";
import PropertyDetailsContent from "./modules/details-view/components/propertyDetailsContent";
import { DataFetchState } from "./modules/generics/components/DataFetchState";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
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
    const fetched = await getPropertyById(id as string);
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </SafeAreaView>
    );
  }

  if (fetchError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">
        <DataFetchState
          variant={fetchError.code === "offline" ? "offline" : "error"}
          title={fetchError.code === "offline" ? "You’re offline" : "Couldn’t load this listing"}
          message={fetchError.message}
          onRetry={retry}
          retryLabel="Try again"
        />
      </SafeAreaView>
    );
  }

  if (notFound || !property) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center px-6">
        <DataFetchState
          variant="empty"
          title="Property not found"
          message="This listing isn’t available or may have been removed."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white items-center w-full">
      <View className="flex-1 w-full mx-auto">
        <PropertyDetailsContent property={property} />
      </View>
    </SafeAreaView>
  );
}
