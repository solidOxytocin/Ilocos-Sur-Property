import { size } from "@/app/theme/size";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Pill from "../../generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
  AMENITY_ICONS,
  MORE_ICON_KEY,
} from "../constants/material-icon-names";
import { Feature, Amenity, Property } from "../../../constants/mock/mock-properties";

interface gridViewCardPropertyProps {
  property: Property;
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
  const MAX_FEATURE = 3;

  //Color
  const ICON_COLOR = isAmenity ? "#059669" : "#2563eb";
  const BACKGROUND_COLOR = isAmenity ? "bg-emerald-50 border border-emerald-100" : "bg-blue-50 border border-blue-100";
  const TEXT_COLOR = "text-gray-700";

  //Size
  const ICON_SIZE = 12;
  const TEXT_SIZE = "text-[10px]";
  const TEXT_WEIGHT = "font-medium";

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
    )
  }
}

export default function gridViewCardProperty({
  property: property,
}: gridViewCardPropertyProps) {
  const router = useRouter();
  const isSold = property?.status?.toUpperCase() === "SOLD";
  
  return (
    <TouchableOpacity
      className="bg-white shadow-sm border-gray-200 border flex-col rounded-xl overflow-hidden m-1 md:m-2 w-[45vw] sm:w-[46vw] md:w-[16rem] hover:shadow-lg hover:shadow-gray-400 transition-shadow"
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: "/details",
          params: { id: property.id },
        });
      }}
    >
      {/* Image Preview */}
      <View className="relative w-full h-36">
        <Image
          source={{ uri: property?.media?.[0]?.url }}
          className="w-full h-full"
          style={isSold ? { opacity: 0.5 } : undefined}
          resizeMode="cover"
        />
        {/* Grayscale overlay for sold properties */}
        {isSold && (
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30" />
        )}
        
        {/* Media count] */}
        {(property?.media?.length ?? 0) > 1 && (
          <View className="absolute bottom-2 right-2 bg-black/60 rounded-full flex-row items-center px-2 py-1">
            <MaterialCommunityIcons name="camera-outline" size={12} color="white" />
            <Text className="text-white text-[10px] font-bold ml-1">+{(property?.media?.length ?? 1) - 1}</Text>
          </View>
        )}

        {/* Status at top Left */}
        <View className="absolute top-2 left-1">
          <Pill 
              text={property?.status?.toUpperCase() || "AVAILABLE"} 
              icon="check-circle" 
              iconSize={10} 
              textSize="text-[10px]" 
              backGroundColor={isSold ? "bg-red-600" : property?.status?.toUpperCase() === "RESERVED" ? "bg-orange-500" : "bg-emerald-500"}
              compact
          />
        </View>

        {/* Property type at bottom left */}
        <View className="absolute bottom-2 left-1">
           <Pill 
                text={property?.type?.toUpperCase() || "PROPERTY"} 
                icon="home-city" 
                iconSize={10} 
                textSize="text-[10px]" 
                backGroundColor="bg-blue-600"
                compact
          />
        </View>
      </View>

      {/* Content */}
      <View className="flex-col p-3 flex-1 justify-between min-h-[140px]">
        
        {/* Header */}
        <View>
          <View className="flex-1 flex-row items-center justify-center">
             <Text className="font-bold text-[15px] text-gray-800" numberOfLines={1}>
              {property?.location?.city || "Unknown Location"}
            </Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center">  
              <Text className="font-normal text-xs text-gray-500 mb-2" numberOfLines={1}>
                {property?.location?.barangay || " "}
              </Text>
          </View>
        
          
          <View className="flex-row flex-wrap min-h-[44px]">
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

        <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-gray-100">
           <View className="flex-row items-center">
             <MaterialCommunityIcons name="vector-square" size={21} color="#fb923c" />
             <Text className="font-bold text-[14px] text-orange-600 ml-1">
               {property?.lotArea ? `${property.lotArea} SQM` : "N/A"}
             </Text>
           </View>
           <Text className="font-extrabold text-base text-blue-600">
             {(() => {
               if (!property?.price) return "";
               const p = Number(property.price);
               if (p < 1000) return `₱${p}`;
               if (p < 1000000) return `₱${(p / 1000).toFixed(0)}K`;
               if (p < 1000000000) return `₱${(p / 1000000).toFixed(0)}M`;
               return `₱${(p / 1000000000).toFixed(0)}B`;
             })()}
           </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
