import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Pill from "../../generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
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
  if (index > MAX_FEATURE) {
    return null;
  }
  let iconName = FEATURE_ICONS[item.key] ?? FEATURE_ICONS[EMPTY_ICON_KEY];
  if (index === MAX_FEATURE && length > MAX_FEATURE) {
    iconName = "dots-horizontal" as MaterialIconName;
    return (
      <Pill text={length - MAX_FEATURE + "+"} icon={iconName} iconSize={9} />
    );
  } else {
    return <Pill text={item.name} icon={iconName} />;
  }
}

export default function gridViewCardProperty({
  property: property,
}: gridViewCardPropertyProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      className=" flex-col bg-white rounded-lg  gap-2 m-2 w-[13rem]"
      onPress={() => {
        router.push({
          pathname: "/details",
          params: { property: JSON.stringify(property) },
        });
      }}
    >
      <Image
        source={{ uri: property.media[0]?.url }}
        className="w-full h-40 rounded-t-lg mb-2 "
      />

      <View className="flex-1 ">
        <View className=" flex-col justify-center items-center mb-2">
          <Text className="text-lg font-medium text-gray-800">
            {property.location.city}
          </Text>
          <Text className="text-lg font-medium text-gray-800">
            {property.location.barangay}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-1 flex-">
          {property.features.slice(0, 4).map((feature, index) => {
            return (
              <FeatureIconsComponent
                key={index}
                item={feature}
                index={index + 1}
                length={property.features.length}
              />
            );
          })}
        </View>
      </View>
      <View className="flex-row justify-evenly mb-2 ">
        <Text className="text-lg font-bold text-orange-400">
          {property.lotArea}SQM
        </Text>
        <Text className="text-lg font-bold text-blue-800">
          ₱{property.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
