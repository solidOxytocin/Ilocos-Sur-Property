import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, Image, Text, View } from "react-native";
import {
  MATERIAL_ICON_NAMES,
  MaterialIconName,
} from "../constants/material-icon-names";
import { Feature, Property } from "../constants/mock-properties";

interface gridViewCardPropertyProps {
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

export default function gridViewCardProperty({
  property: property,
}: gridViewCardPropertyProps) {
  return (
    <View className="bg-white rounded-lg m-2  shadow-md shadow-gray-300  w-60">
      <Image
        source={{ uri: property.photo }}
        className=" w-full h-24 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 justify-between py-4 px-5">
        <View className=" p-3">
          {/* Header */}
          <View className="items-center">
            <Text className="font-bold text-xl" numberOfLines={1}>
              {property.city}
            </Text>
            <Text className="text-base" numberOfLines={1}>
              {property.barangay}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View className="flex-col items-center">
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
            columnWrapperStyle={{
              justifyContent: "center",
              paddingHorizontal: 8,
            }}
            contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 4 }}
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
    </View>
  );
}
