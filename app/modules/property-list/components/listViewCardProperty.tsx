import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  MATERIAL_ICON_NAMES,
  MaterialIconName,
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

  const iconName = MATERIAL_ICON_NAMES.includes(item.icon as MaterialIconName)
    ? (item.icon as MaterialIconName)
    : ("help-icon" as MaterialIconName);
  if (index === MAX_FEATURE && length > MAX_FEATURE) {
    return (
      <View className="bg-blue-50 rounded-full px-3 py-1.5 flex-row items-center">
        <MaterialCommunityIcons
          name="dots-horizontal"
          color="#3B82F6"
          size={14}
        />
        <Text
          className="text-xs text-blue-600 font-medium ml-1"
          numberOfLines={1}
        >
          {length - MAX_FEATURE}+
        </Text>
      </View>
    );
  } else {
    return (
      <View className="bg-blue-50 rounded-full px-3 py-1.5 flex-row items-center">
        <MaterialCommunityIcons name={iconName} color="#3B82F6" size={14} />
        <Text
          className="text-xs text-gray-700 font-medium ml-1.5"
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </View>
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
