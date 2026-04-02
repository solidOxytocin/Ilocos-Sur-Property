import { size } from "@/app/theme/size";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Pill from "../../generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
  MORE_ICON_KEY,
} from "../constants/material-icon-names";
import { Feature, Property } from "../../../constants/mock/mock-properties";

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
  const MAX_FEATURE = size.gridMaxFeatures;

  //Color
  const ICON_COLOR = "#fff";
  const BACKGROUND_COLOR = "bg-blue-700";
  const TEXT_COLOR = "text-white";

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
        weight={TEXT_WEIGHT} />
    )

  }
}

export default function gridViewCardProperty({
  property: property,
}: gridViewCardPropertyProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="bg-white shadow-gray-300 flex-col rounded-lg gap-2 m-1 md:m-2 w-[45vw] sm:w-[46vw] md:w-[16rem] hover:shadow-lg hover:shadow-gray-400 transition-shadow"
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: "/details",
          params: { id: property.id },
        });
      }}
    >
      <Image
        source={{ uri: property.media[0]?.url }}
        className="w-full h-40 rounded-t-lg mb-2 "
      />

      <View className="flex-1 ">
        <View className=" flex-col justify-center items-center mb-2">
          <Text className="font-medium text-lg">
            {property.location.city}
          </Text>
          <Text className="font-normal text-base">
            {property.location.barangay}
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-1 flex-">
          {(property.features ?? []).slice(0, 4).map((feature, index) => {
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
        <Text className="font-bold text-lg text-orange-400">
          {property.lotArea}SQM
        </Text>
        <Text className="font-bold text-lg text-blue-600">
          ₱{property.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
