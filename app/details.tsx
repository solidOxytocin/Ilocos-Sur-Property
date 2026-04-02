import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPropertyById } from "./service/property-service";
import DetailsHeader from "./modules/details-view/components/detailsHeader";
import Pill from "./modules/generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
} from "./modules/property-list/constants/material-icon-names";
import { Property } from "./constants/mock/mock-properties";
import { size } from "./theme/size";

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

  const ICON_SIZE = size.pillDetailsIcon;
  const TEXT_SIZE = "text-base";

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
    <SafeAreaView className="flex-1 bg-gray-100">
      <DetailsHeader properties={properties} />
      <Image
        source={{ uri: properties?.media[0]?.url }}
        className="w-full h-64 "
      />

      <View className="flex-1  justify-between px-4 mt-4 gap-1 ml-2">
        <View className="gap-1">
          <Text className="text-3xl font-bold mb-2">
            {properties?.location.address} , {properties?.location.barangay},
            {properties?.location.city}
          </Text>
          <View className="flex-row flex-wrap">
            <Text className="text-lg font-bold mr-2">Price:</Text>
            <Text className="text-lg font-bold text-blue-600">
              ₱{properties?.price.toString().toLocaleString()}
            </Text>
          </View>

          <View className="flex-row flex-wrap">
            <Text className="text-lg font-bold mr-2">
              Area:
            </Text>
            <Text className="text-lg font-bold text-orange-400">
              {properties?.lotArea?.toString()} 
              SQM
            </Text>
          </View>
          {/* <Text className="text-lg font-bold">Features:</Text> */}
          <View className="flex-row flex-wrap mb-2">
            {properties?.features.map((feature, index) => (
              <View key={index} className="mt-2">
                <Pill
                  text={feature.name}
                  icon={
                    FEATURE_ICONS[feature.key] ?? FEATURE_ICONS[EMPTY_ICON_KEY]
                  }
                  iconSize={ICON_SIZE}
                  textSize={TEXT_SIZE}
                />
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            <Text className="text-lg font-bold mr-2">
              Description:
            </Text>
            <Text className="text-lg text-gray-600">
              {properties?.details}
            </Text>
          </View>
        </View>
        <View className=" justify-center">
          <TouchableOpacity
            className="bg-blue-700 rounded-md mb-5"
            onPress={() => {
              // Handle the button press, e.g., navigate to an inquiry form or open a contact modal
              console.log(
                "Inquire button pressed for property:",
                properties?.id,
              );
            }}
          >
            <Text className="text-lg font-bold text-white self-center py-2">
              Inquire
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
