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
  const ICON_COLOR = isAmenity ? "#16A34A" : "#3B82F6";
  const TEXT_COLOR = "text-gray-700";
  const BACKGROUND_COLOR = isAmenity ? "bg-green-50": "bg-blue-50";

  //Size
  const ICON_SIZE = size.pillIconSize;
  const TEXT_SIZE = "text-xs";
  const TEXT_WEIGHT = "font-semibold";

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
      className="flex-col bg-white rounded-lg m-2 shadow-sm hover:shadow-gray-400 hover:shadow-md transition-shadow"
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View className="relative">
        <Image
          className="w-full h-40 rounded-t-lg mb-1"
          source={{ uri: property?.media?.[0]?.url }}
          style={isSold ? { opacity: 0.45 } : undefined}
        />
        {/* Grayscale overlay for sold properties */}
        {isSold && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 4,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              backgroundColor: "rgba(120,120,120,0.45)",
            }}
          />
        )}
        {(property?.media?.length ?? 0) > 1 && (
          <View className="absolute bottom-2 right-2 bg-black/60 rounded-full flex-row items-center px-2 py-1">
            <MaterialCommunityIcons name="camera-outline" size={14} color="white" />
            <Text className="text-white text-xs font-bold ml-1">+{(property?.media?.length ?? 1) - 1}</Text>
          </View>
        )}

         <View className="flex-row absolute bottom-3 left-2">
          <Pill 
                          text={property?.type?.toUpperCase() || "PROPERTY"} 
                          icon="home-city" 
                          iconSize={14} 
                          textSize="text-xs" 
                          backGroundColor="bg-purple-600" 
                    />
            <Pill 
                text={property?.status?.toUpperCase() || "AVAILABLE"} 
                icon="check-circle" 
                iconSize={14} 
                textSize="text-xs" 
                backGroundColor={property?.status?.toUpperCase() === "SOLD" ? "bg-red-600" : property?.status?.toUpperCase() === "RESERVED" ? "bg-yellow-600" : "bg-teal-600"} 
            />
        </View>
      </View>
      <View className="flex-col justify-center items-center gap-1 px-2 mt-2 min-h-[52px]">
        <Text className="font-medium text-lg text-center" numberOfLines={1}>
          {property?.location?.city || "Unknown Location"}
        </Text>
        <Text className="font-normal text-base text-gray-500 text-center" numberOfLines={1}>
          {property?.location?.barangay || " "}
        </Text>
      </View>
      <View className="flex-row flex-wrap justify-center content-start gap-1 mx-2 min-h-[60px] my-2">
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

      <View className="flex-row justify-evenly mb-3 items-center">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="vector-square" size={16} color="#fb923c" />
          <Text className="font-bold text-lg text-orange-400 ml-1">
            {property?.lotArea ? `${property.lotArea} SQM` : "N/A"}
          </Text>
        </View>
        <Text className="font-bold text-lg text-blue-600"> ₱{property?.price ?? "0"}</Text>
      </View>
    </TouchableOpacity>
  );
}
export default ListViewCardProperty;
