import { color, pillColor } from "@/app/theme/color";
import { size } from "@/app/theme/size";
import { typography } from "@/app/theme/typography";
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
  const ICON_COLOR = pillColor.iconColorSecondary;
  const BACKGROUND_COLOR = pillColor.backGroundColorPrimary;
  const TEXT_COLOR = pillColor.textColorPrimary;

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
      className={`${color.bgWhite}  ${ color.shadowGray}  flex-col  rounded-lg  gap-2 m-2 w-[13rem]`}
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
          <Text className={`${typography.header.weight} ${typography.header.size}  `}>
            {property.location.city}
          </Text>
          <Text className={`${typography.normal.weight} ${typography.normal.size}  `}>
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
        <Text className={`${typography.headerBold.weight} ${typography.headerBold.size} ${color.txtOrange} `}>
          {property.lotArea}SQM
        </Text>
        <Text className={`${typography.headerBold.weight} ${typography.headerBold.size} ${color.txtBlue} `}>
          ₱{property.price}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
