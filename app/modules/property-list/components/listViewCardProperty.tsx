import React from "react";
import { Image, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { size } from "@/app/theme/size";
import { useRouter } from "expo-router";
import Pill from "../../generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
  AMENITY_ICONS,
  MORE_ICON_KEY,
} from "../constants/material-icon-names";
import { Feature, Amenity, Property } from "../../../constants/mock/mock-properties";

interface ListViewCardPropertyProps {
  property: Property;
  onPress?: () => void;
  /** Narrow list column in web split view (35% list / 65% details). */
  compact?: boolean;
  isSelected?: boolean;
}

interface ItemPillComponentProps {
  item: Feature | Amenity;
  index: number;
  length: number;
  isAmenity?: boolean;
}

function ItemPillComponent({
  item,
  index,
  length,
  isAmenity = false,
}: ItemPillComponentProps) {
  const MAX_FEATURE = size.gridMaxFeatures;

  //color
  const ICON_COLOR = isAmenity ? "#059669" : "#2563EB";
  const TEXT_COLOR = "text-gray-700";
  const BACKGROUND_COLOR = isAmenity ? "bg-emerald-50 border border-emerald-100" : "bg-blue-50 border border-blue-100";

  //Size
  const ICON_SIZE = 14;
  const TEXT_SIZE = "text-[11px]";
  const TEXT_WEIGHT = "font-bold";

  if (index > MAX_FEATURE) {
    return null;
  }

  let iconName = isAmenity 
    ? (AMENITY_ICONS[item.key] ?? AMENITY_ICONS[EMPTY_ICON_KEY])
    : (FEATURE_ICONS[item.key] ?? FEATURE_ICONS[EMPTY_ICON_KEY]);

  if (index === MAX_FEATURE && length > MAX_FEATURE) {
    iconName = isAmenity 
      ? (AMENITY_ICONS[MORE_ICON_KEY] ?? AMENITY_ICONS[EMPTY_ICON_KEY])
      : (FEATURE_ICONS[MORE_ICON_KEY] ?? FEATURE_ICONS[EMPTY_ICON_KEY]);
    return (
      <View className="mb-1">
        <Pill
          text={length - MAX_FEATURE + "+"}
          icon={iconName}
          iconSize={ICON_SIZE}
          iconColor={ICON_COLOR}
          backGroundColor={BACKGROUND_COLOR}
          textColor={TEXT_COLOR}
          textSize={TEXT_SIZE}
          weight={TEXT_WEIGHT}
          compact
        />
      </View>
    );
  } else {
    return (
      <View className="mb-1">
        <Pill
          text={item.name}
          icon={iconName}
          iconSize={ICON_SIZE}
          iconColor={ICON_COLOR}
          backGroundColor={BACKGROUND_COLOR}
          textColor={TEXT_COLOR}
          textSize={TEXT_SIZE}
          weight={TEXT_WEIGHT}
          compact
        />
      </View>
    );
  }
}

export function ListViewCardProperty({
  property,
  onPress,
  compact = false,
  isSelected = false,
}: ListViewCardPropertyProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isHorizontal = !compact && width >= 768;
  const isSold = property?.status?.toUpperCase() === "SOLD";

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
      className={`relative bg-white rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-900/10 transition-all duration-300 overflow-hidden ${
        compact ? "m-1 flex-col" : "m-2 rounded-2xl"
      } ${
        isSelected
          ? "border-2 border-blue-600 ring-2 ring-blue-100"
          : "border border-gray-100 hover:border-blue-200"
      } ${isHorizontal ? "flex-row h-64" : compact ? "flex-col min-h-[340px]" : "flex-col"} ${
        isSold ? "opacity-75" : ""
      }`}
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <View
        className={`relative ${
          isHorizontal ? "w-[45%] h-full" : compact ? "w-full h-48" : "w-full h-60"
        }`}
      >
        <Image
          className="w-full h-full bg-gray-100"
          source={{ uri: property?.media?.[0]?.url }}
          resizeMode="cover"
        />
        
        {/* Top Left: Status Pill */}
        <View className={`absolute ${compact ? "top-2 left-2" : "top-3 left-3"}`}>
            <Pill 
                text={property?.status?.toUpperCase() || "AVAILABLE"} 
                icon="check-circle" 
                iconSize={compact ? 10 : 12} 
                textSize="text-[10px]" 
                backGroundColor={property?.status?.toUpperCase() === "SOLD" ? "bg-red-600" : property?.status?.toUpperCase() === "RESERVED" ? "bg-orange-500" : "bg-emerald-500"} 
                textColor="text-white"
                compact
            />
        </View>

        {/* Bottom Left: Property Type */}
        <View className={`absolute ${compact ? "bottom-2 left-2" : "bottom-3 left-3"}`}>
          <Pill 
            text={property?.type?.toUpperCase() || "PROPERTY"} 
            icon="home-city" 
            iconSize={compact ? 12 : 14} 
            textSize="text-xs" 
            backGroundColor="bg-blue-600/90" 
            textColor="text-white"
            compact
          />
        </View>

        {/* Bottom Right: Media Count */}
        {!compact && (property?.media?.length ?? 0) > 1 && (
          <View className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md rounded-full flex-row items-center px-3 py-1.5">
            <MaterialCommunityIcons name="image-multiple-outline" size={14} color="white" />
            <Text className="text-white text-xs font-bold ml-1.5">+{(property?.media?.length ?? 1) - 1}</Text>
          </View>
        )}
      </View>

      <View
        className={`${compact ? "p-3.5 flex-1" : "p-4"} ${
          isHorizontal || compact ? "flex-1 justify-between" : ""
        }`}
      >
        <View>
          <Text
            className={`font-extrabold text-gray-900 ${compact ? "text-base mb-1" : "text-2xl mb-1.5"}`}
            numberOfLines={1}
          >
            {property?.location?.city || "Unknown Location"}
          </Text>
          <View className="flex-row items-center">
            {!compact && (
              <MaterialCommunityIcons name="map-marker-outline" size={18} color="#6b7280" />
            )}
            <Text
              className={`text-gray-500 ${compact ? "text-sm" : "font-medium text-base ml-1"}`}
              numberOfLines={1}
            >
              {property?.location?.barangay || "—"}
            </Text>
          </View>

          <View className={`h-[1px] bg-gray-100 w-full ${compact ? "my-3" : "my-3.5"}`} />

          <View className="flex-row flex-wrap gap-x-1.5 gap-y-1">
            {(() => {
              const combined = [
                ...(property?.features ?? []).map((f) => ({ ...f, isAmenity: false })),
                ...(property?.amenities ?? []).map((a) => ({ ...a, isAmenity: true })),
              ];
              const maxPills = compact ? 3 : isHorizontal ? 3 : 4;
              return combined.slice(0, maxPills).map((item, index) => (
                <ItemPillComponent
                  key={index}
                  item={item}
                  index={index + 1}
                  length={combined.length}
                  isAmenity={item.isAmenity}
                />
              ));
            })()}
          </View>
        </View>

        <View
          className={`flex-row items-center justify-between ${
            compact ? "mt-3 pt-3 border-t border-gray-100" : "mt-4 pt-4 border-t border-gray-100"
          }`}
        >
          <Text className={`font-bold text-blue-600 ${compact ? "text-base" : "text-lg"}`}>
            ₱{Number(property?.price ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </Text>
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="vector-square"
              size={compact ? 20 : 21}
              color="#fb923c"
            />
            <Text className={`font-bold text-orange-600 ml-1 ${compact ? "text-base" : "text-lg"}`}>
              {property?.lotArea ? `${property.lotArea} SQM` : "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {isSold && (
        <View
          pointerEvents="none"
          className="absolute inset-0 bg-gray-500/30"
          style={{ zIndex: 10 }}
        />
      )}
    </TouchableOpacity>
  );
}
export default ListViewCardProperty;

