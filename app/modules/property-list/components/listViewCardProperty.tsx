import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";
import {
  MATERIAL_ICON_NAMES,
  MaterialIconName,
} from "../constants/material-icon-names";
import { Feature, Property } from "../constants/mock-properties";

const router = useRouter();

interface ListViewCardPropertyProps {
  property: Property;
}

interface FeatureIconsComponentProps {
  item: Feature;
  index: number;
  length: number;
}

function FeatureIconsComponent({
  item,
  index,
  length,
}: FeatureIconsComponentProps) {
  const MAX_FEATURE = 4;
  const iconName: MaterialIconName = MATERIAL_ICON_NAMES.includes(
    item.icon as MaterialIconName,
  )
    ? (item.icon as MaterialIconName)
    : "help-circle";
  if (index > MAX_FEATURE) {
    return null;
  }
  if (index === MAX_FEATURE && length > MAX_FEATURE) {
    return (
      <View className="  bg-gray-200 rounded-lg m-1 px-2 py-1 flex-row gap-1">
        <MaterialCommunityIcons
          name="dots-horizontal"
          color="black"
          size={20}
        />{" "}
        <Text className="text-sm">+{length - MAX_FEATURE} more </Text>
      </View>
    );
  } else {
    return (
      <View className=" m-1 bg-gray-200 rounded-lg px-2 py-1 flex-row items-center">
        <MaterialCommunityIcons name={iconName} color="black" size={19} />
        <Text className=" text-xs ml-1">{item.name}</Text>
      </View>
    );
  }
}

export function ListViewCardProperty({ property }: ListViewCardPropertyProps) {
  const renderItem = ({ item, index }: { item: Feature; index: number }) => {};

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/details",
          params: { property: JSON.stringify(property) },
        })
      }
      className="flex-row bg-white rounded-lg m-2 shadow-md shadow-gray-300 px-3 py-2"
    >
      <Image
        source={{ uri: property.photo }}
        className="w-36 h-36 rounded-sm"
      />

      <View className="flex-1 ml-3 justify-between">
        {/* Header */}
        <View className="items-center">
          <Text className="font-bold text-xl" numberOfLines={1}>
            {property.city}
          </Text>
          <Text className="text-base" numberOfLines={1}>
            {property.barangay}
          </Text>
        </View>

        {/* Features */}

        <View className="flex-col items-start justify-start ">
          <FlatList
            data={property.features}
            renderItem={({ item, index }) => (
              <FeatureIconsComponent
                item={item}
                index={index + 1}
                length={property.features.length}
              />
            )}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Push to bottom */}
        <View className="flex-row justify-evenly">
          <Text className="text-lg text-orange-400 font-bold">
            {property.sqm}sqm
          </Text>
          <Text className="text-lg text-blue-500 font-bold">
            {property.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
export default ListViewCardProperty;
