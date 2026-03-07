import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { color, pillColor } from "@/app/theme/color";
import { size } from "@/app/theme/size";
import { typography } from "@/app/theme/typography";
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
  const MAX_FEATURE = size.gridMaxFeatures;

  //color
  const ICON_COLOR = pillColor.iconColor;
  const TEXT_COLOR = pillColor.textColorSecondary;
  const BACKGROUND_COLOR = pillColor.backGroundColorSecondary;

  //Size
  const ICON_SIZE = size.pillIconSize;
  const TEXT_SIZE = typography.pill.size;
  const TEXT_WEIGHT = typography.pill.weight;

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

export function ListViewCardProperty({ property }: ListViewCardPropertyProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className={`flex-col ${color.bgWhite} rounded-lg m-2 shadow-md ${ color.shadowGray}  `}
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
        <Text className={`${typography.title.weight} ${typography.title.size}`}> {property.location.city}</Text>
        <Text className={`${typography.normal.weight} ${typography.normal.size}`}> {property.location.barangay}</Text>
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
        <Text className={`${typography.headerBold.weight} ${typography.headerBold.size} ${color.txtOrange} `}>
          {" "}
          {property.lotArea} SQM
        </Text>
        <Text className={`${typography.headerBold.weight} ${typography.headerBold.size} ${color.txtBlue} `}> ₱{property.price}</Text>
      </View>
    </TouchableOpacity>
  );
}
export default ListViewCardProperty;
