import { useLocalSearchParams } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DetailsHeader from "./modules/details-view/components/detailsHeader";
import Pill from "./modules/generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
} from "./modules/property-list/constants/material-icon-names";
import { Property } from "./modules/property-list/constants/mock-properties";

export default function PropertyDetails() {
  const { property } = useLocalSearchParams();
  const parsedProperty = property ? JSON.parse(property as string) : null;
  const properties = parsedProperty as Property;
  const ICON_SIZE = 14;
  const TEXT_SIZE = "base";
  return (
    <SafeAreaView className=" flex-1 bg-gray-100">
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
            <Text className="text-lg text-blue-500 font-bold">
              ₱{properties?.price.toString().toLocaleString()}
            </Text>
          </View>

          <View className="flex-row flex-wrap">
            <Text className="text-lg  font-bold mr-2">Area:</Text>
            <Text className="text-lg text-orange-400 font-bold">
              {properties?.lotArea?.toString()} SQM
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
            <Text className="text-lg font-bold mr-2">Description:</Text>
            <Text className="text-lg text-gray-700">{properties?.details}</Text>
          </View>
        </View>
        <View className=" justify-center">
          <TouchableOpacity
            className=" rounded-md bg-blue-600 mb-5"
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
