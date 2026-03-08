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
import { color } from "./theme/color";
import { size } from "./theme/size";
import { typography } from "./theme/typography";

export default function PropertyDetails() {
  const { property } = useLocalSearchParams();
  const parsedProperty = property ? JSON.parse(property as string) : null;
  const properties = parsedProperty as Property;
  const ICON_SIZE = size.pillDetailsIcon;
  const TEXT_SIZE = typography.detailPill.size;
  return (
    <SafeAreaView className={` flex-1 ${color.bgGray}`}>
      <DetailsHeader properties={properties} />
      <Image
        source={{ uri: properties?.media[0]?.url }}
        className="w-full h-64 "
      />

      <View className="flex-1  justify-between px-4 mt-4 gap-1 ml-2">
        <View className="gap-1">
          <Text className={`${typography.bigTextBold.size} ${typography.bigTextBold.weight} mb-2`}>
            {properties?.location.address} , {properties?.location.barangay},
            {properties?.location.city}
          </Text>
          <View className="flex-row flex-wrap">
            <Text className={`${typography.headerBold.size} ${typography.headerBold.weight} mr-2`}>Price:</Text>
            <Text className={`${typography.headerBold.size} ${typography.headerBold.weight} ${color.txtBlue}`}>
              ₱{properties?.price.toString().toLocaleString()}
            </Text>
          </View>

          <View className="flex-row flex-wrap">
            <Text className={`
              ${typography.headerBold.size} 
              ${typography.headerBold.weight} 
              mr-2`}>Area:
            </Text>
            <Text className={`
              ${typography.headerBold.size} 
              ${typography.headerBold.weight} 
              ${color.txtOrange}`}>
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
            <Text className={`
              ${typography.headerBold.size} 
              ${typography.headerBold.weight} 
              mr-2`}>Description:</Text>
            <Text className={`
              ${typography.headerBold.size} 
              ${color.txtGrayParagraph}`}
            >
              {properties?.details}
            </Text>
          </View>
        </View>
        <View className=" justify-center">
          <TouchableOpacity
            className={`
              ${color.bgPrimary} 
              rounded-md 
              mb-5`}
            onPress={() => {
              // Handle the button press, e.g., navigate to an inquiry form or open a contact modal
              console.log(
                "Inquire button pressed for property:",
                properties?.id,
              );
            }}
          >
            <Text className={`
              ${typography.headerBold.size} 
              ${typography.headerBold.weight} 
              ${color.txtWhite}
              self-center 
              py-2`}>
              Inquire
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
