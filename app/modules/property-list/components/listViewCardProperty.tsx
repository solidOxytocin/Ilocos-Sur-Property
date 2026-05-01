import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
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

export function ListViewCardProperty({ property, onPress }: ListViewCardPropertyProps) {
  const router = useRouter();
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
      className="flex-col bg-white rounded-2xl m-2 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-blue-900/10 hover:border-blue-200 transition-all duration-300 overflow-hidden"
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <View className="relative">
        <Image
          className="w-full h-52 bg-gray-100"
          source={{ uri: property?.media?.[0]?.url }}
          style={isSold ? { opacity: 0.6 } : undefined}
          resizeMode="cover"
        />
        {/* Grayscale overlay for sold properties */}
        {isSold && (
          <View className="absolute inset-0 bg-black/20" />
        )}
        
        {/* Top Left: Status Pill */}
        <View className="absolute top-3 left-3">
            <Pill 
                text={property?.status?.toUpperCase() || "AVAILABLE"} 
                icon="check-circle" 
                iconSize={12} 
                textSize="text-[10px]" 
                backGroundColor={property?.status?.toUpperCase() === "SOLD" ? "bg-red-600" : property?.status?.toUpperCase() === "RESERVED" ? "bg-orange-500" : "bg-emerald-500"} 
                textColor="text-white"
                compact
            />
        </View>

        {/* Bottom Left: Property Type */}
        <View className="absolute bottom-3 left-3">
          <Pill 
            text={property?.type?.toUpperCase() || "PROPERTY"} 
            icon="home-city" 
            iconSize={14} 
            textSize="text-xs" 
            backGroundColor="bg-blue-600/90" 
            textColor="text-white"
            compact
          />
        </View>

        {/* Bottom Right: Media Count */}
        {(property?.media?.length ?? 0) > 1 && (
          <View className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md rounded-full flex-row items-center px-3 py-1.5">
            <MaterialCommunityIcons name="image-multiple-outline" size={14} color="white" />
            <Text className="text-white text-xs font-bold ml-1.5">+{(property?.media?.length ?? 1) - 1}</Text>
          </View>
        )}
      </View>

      <View className="p-4">
        {/* Header Row */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className="font-extrabold text-xl text-gray-900 mb-1" numberOfLines={1}>
              {property?.location?.city || "Unknown Location"}
            </Text>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6b7280" />
              <Text className="font-medium text-sm text-gray-500 ml-1" numberOfLines={1}>
                {property?.location?.barangay || " "}
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <Text className="font-black text-xl text-blue-600">
              ₱{Number(property?.price ?? 0).toLocaleString()}
            </Text>
            {property?.lotArea && (
              <View className="flex-row items-center mt-1.5 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                <MaterialCommunityIcons name="vector-square" size={12} color="#f97316" />
                <Text className="font-bold text-[11px] text-orange-600 ml-1">
                  {property.lotArea} SQM
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-gray-100 w-full my-3" />

        {/* Features Row */}
        <View className="flex-row flex-wrap gap-x-2 gap-y-1">
          {(() => {
            const combined = [
              ...(property?.features ?? []).map((f) => ({ ...f, isAmenity: false })),
              ...(property?.amenities ?? []).map((a) => ({ ...a, isAmenity: true })),
            ];
            return combined.slice(0, 4).map((item, index) => (
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
    </TouchableOpacity>
  );
}
export default ListViewCardProperty;

