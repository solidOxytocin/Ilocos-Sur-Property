import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { size } from "@/app/theme/size";
import { useRouter } from "expo-router";
import Pill from "../../generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
  MORE_ICON_KEY,
} from "../constants/material-icon-names";
import { Feature, Property } from "../../../constants/mock/mock-properties";

interface ListViewCardPropertyProps {
  property: Property;
  onPress?: () => void;
}

interface FeatureIconsComponentProps {
  item: Feature;
  index: number;
  length: number;
}
// color="#3B82F6"
function FeatureIconsComponent({
  item,
  index,
  length,
}: FeatureIconsComponentProps) {
  const MAX_FEATURE = size.gridMaxFeatures;

  //color
  const ICON_COLOR = "#3B82F6";
  const TEXT_COLOR = "text-gray-700";
  const BACKGROUND_COLOR = "bg-blue-50";

  //Size
  const ICON_SIZE = size.pillIconSize;
  const TEXT_SIZE = "text-xs";
  const TEXT_WEIGHT = "font-semibold";

  if (index > MAX_FEATURE) {
    return null;
  }

  let iconName = FEATURE_ICONS[item.key] ?? FEATURE_ICONS[EMPTY_ICON_KEY];

  if (index === MAX_FEATURE && length > MAX_FEATURE) {
    iconName = FEATURE_ICONS[MORE_ICON_KEY] ?? FEATURE_ICONS[EMPTY_ICON_KEY];
    return (
      <Pill
        text={length - MAX_FEATURE + "+"}
        icon={iconName}
        iconSize={ICON_SIZE}
        iconColor={ICON_COLOR}
        backGroundColor={BACKGROUND_COLOR}
        textColor={TEXT_COLOR}
        textSize={TEXT_SIZE}
        weight={TEXT_WEIGHT}
      />
    );
  } else {
    return (
      <Pill
        text={item.name}
        icon={iconName}
        iconSize={ICON_SIZE}
        iconColor={ICON_COLOR}
        backGroundColor={BACKGROUND_COLOR}
        textColor={TEXT_COLOR}
        textSize={TEXT_SIZE}
        weight={TEXT_WEIGHT}
      />
    );
  }
}

export function ListViewCardProperty({ property, onPress }: ListViewCardPropertyProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push({
        pathname: "/details",
        params: { id: property.id },
      });
    }
  };

  return (
    <TouchableOpacity
      className="flex-col bg-white rounded-lg m-2 shadow-sm hover:shadow-gray-400 hover:shadow-md transition-shadow"
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <Image
        className="w-full h-40 rounded-t-lg mb-1"
        source={{ uri: property.media[0]?.url }}
      />
      <View className="flex-col   justify-center items-center gap-1">
        <Text className="font-medium text-lg">
          {property.location.city}
        </Text>
        <Text className="font-normal text-base">
          {property.location.barangay}
        </Text>
      </View>
      <View className="flex-row m-2">
        {(property.features ?? [] ).slice(0, 4).map((item, index) => {
          return (
            <FeatureIconsComponent
              key={index}
              item={item}
              index={index + 1}
              length={property.features.length}
            />
          );
        })}
      </View>

      <View className=" flex-row justify-evenly mb-3">
        <Text className="font-bold text-lg text-orange-400">
          {" "}
          {property.lotArea} SQM
        </Text>
        <Text className="font-bold text-lg text-blue-600"> ₱{property.price}</Text>
      </View>
    </TouchableOpacity>
  );
}
export default ListViewCardProperty;
