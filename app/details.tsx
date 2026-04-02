import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPropertyById } from "./service/property-service";
import { Property } from "./constants/mock/mock-properties";
import PropertyDetailsContent from "./modules/details-view/components/propertyDetailsContent";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
  const [properties, setProperties] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      if (id) {
        const fetchedProperty = await getPropertyById(id as string);
        setProperties(fetchedProperty);
      }
      setLoading(false);
    }
      fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </SafeAreaView>
    );
  }

  if (!properties) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-lg text-gray-600">Property not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 items-center w-full">
      <View className="flex-1 w-full max-w-5xl mx-auto shadow-sm shadow-gray-200">
        <PropertyDetailsContent property={properties} />
      </View>
    </SafeAreaView>
  );
}
