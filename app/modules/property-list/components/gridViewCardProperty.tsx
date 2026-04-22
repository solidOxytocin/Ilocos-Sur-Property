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
  const MAX_FEATURE = size.gridMaxFeatures;

  //Color
  const ICON_COLOR = isAmenity ? "#16A34A" : "#3B82F6";
  const BACKGROUND_COLOR = isAmenity ? "bg-green-50 border border-green-100" : "bg-blue-50 border border-blue-100";
  const TEXT_COLOR = "text-gray-700";

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
        weight={TEXT_WEIGHT} />
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
      className="bg-white shadow-gray-300 flex-col rounded-lg gap-2 m-1 md:m-2 w-[45vw] sm:w-[46vw] md:w-[16rem] hover:shadow-lg hover:shadow-gray-400 transition-shadow"
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: "/details",
          params: { id: property.id },
        });
      }}
    >
      <View className="relative">
        <Image
          source={{ uri: property.media[0]?.url }}
          className="w-full h-40 rounded-t-lg mb-2"
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
              bottom: 8,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              backgroundColor: "rgba(120,120,120,0.45)",
            }}
          />
        )}
        {property.media.length > 1 && (
          <View className="absolute top-3 right-2 bg-black/60 rounded-full flex-row items-center px-2 py-1">
            <MaterialCommunityIcons name="camera-outline" size={14} color="white" />
            <Text className="text-white text-xs font-bold ml-1">+{property.media.length - 1}</Text>
          </View>
        )}

         <View className="flex-row absolute bottom-3 left-1">
           <Pill 
                text={property?.type?.toUpperCase() || "PROPERTY"} 
                icon="home-city" 
                iconSize={11} 
                textSize="text-xs" 
                backGroundColor="bg-purple-600"
                compact
          />
              <Pill 
                  text={property?.status?.toUpperCase() || "AVAILABLE"} 
                  icon="check-circle" 
                  iconSize={11} 
                  textSize="text-xs" 
                  backGroundColor={property?.status?.toUpperCase() === "SOLD" ? "bg-red-600" : property?.status?.toUpperCase() === "RESERVED" ? "bg-yellow-600" : "bg-teal-600"}
                  compact
              />
          </View>
      </View>

      <View className="flex-1 ">
        <View className=" flex-col justify-center items-center mb-2">
          <Text className="font-medium text-lg">
            {property.location.city}
          </Text>
          <Text className="font-normal text-base">
            {property.location.barangay}
          </Text>
        </View>
        <View className="flex-row flex-wrap justify-center gap-1 mx-2">
          {(() => {
            const combined = [
              ...(property.features ?? []).map((f) => ({ ...f, isAmenity: false })),
              ...(property.amenities ?? []).map((a) => ({ ...a, isAmenity: true })),
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
