import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";
import Pill from "../../generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
  MORE_ICON_KEY,
} from "../constants/material-icon-names";
import { Feature, Property } from "../constants/mock-properties";

interface ListViewCardPropertyProps {
  property: Property;
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
  const MAX_FEATURE = 4;
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
        iconSize={14}
        iconColor="#3B82F6"
        backGroundColor="bg-blue-50"
        textColor="text-gray-700"
      />
    );
  } else {
    return (
      <Pill
        text={item.name}
        icon={iconName}
        iconSize={14}
        iconColor="#3B82F6"
        backGroundColor="bg-blue-50"
        textColor="text-gray-700"
      />
    );
  }
}

export function ListViewCardProperty({ property }: ListViewCardPropertyProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="flex-col bg-white rounded-lg m-2 shadow-md shadow-gray-300 "
      onPress={() => {
        router.push({
          pathname: "/details",
          params: { property: JSON.stringify(property) },
        });
      }}
    >
      <Image
        className="w-full h-40 rounded-t-lg mb-1"
        source={{ uri: property.media[0]?.url }}
      />
      <View className="flex-col justify-center items-center gap-1">
        <Text className=" font-bold "> {property.location.city}</Text>
        <Text className="  "> {property.location.barangay}</Text>
      </View>
      <View className="flex-row m-2">
        {property.features.slice(0, 4).map((item, index) => {
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
        <Text className=" font-bold text-orange-400 ">
          {" "}
          {property.lotArea} SQM
        </Text>
        <Text className=" font-bold text-blue-600"> ₱{property.price}</Text>
      </View>
    </TouchableOpacity>
  );
}
export default ListViewCardProperty;
