import React from "react";
import { Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import DetailsHeader from "./detailsHeader";
import Pill from "../../generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
  AMENITY_ICONS,
} from "../../property-list/constants/material-icon-names";
import { Property } from "../../../constants/mock/mock-properties";
import { size } from "../../../theme/size";

interface PropertyDetailsContentProps {
  property: Property;
  onClose?: () => void;
}

export default function PropertyDetailsContent({ property, onClose }: PropertyDetailsContentProps) {
  const ICON_SIZE = size.pillDetailsIcon;
  const TEXT_SIZE = "text-base";

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <DetailsHeader properties={property} onClose={onClose} />
      
      {/* Modern image container */}
      <View className="px-5 mt-5">
        <View className="shadow-lg shadow-gray-300 rounded-[2rem] bg-gray-100">
          <Image
            source={{ uri: property?.media[0]?.url }}
            className="w-full h-72 rounded-[2rem] bg-gray-200 overflow-hidden"
            resizeMode="cover"
          />
        </View>
      </View>

      <View className="px-5 mt-6 mb-8 gap-6">
        
        {/* Title & Price Section */}
        <View className="flex-row justify-between items-start flex-wrap gap-4">
          <View className="flex-1 min-w-[200px]">
            <Text className="text-2xl font-extrabold text-gray-800 tracking-tight leading-tight">
              {property?.location.address}
            </Text>
            <Text className="text-base text-gray-500 mt-1 font-medium">
              {property?.location.barangay}, {property?.location.city}
            </Text>
          </View>
          <View className="bg-blue-50 px-4 py-2 rounded-xl">
            <Text className="text-xl font-bold text-blue-700">
              ₱{property?.price.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Info Highlights */}
        <View className="flex-row flex-wrap items-center bg-gray-50 rounded-2xl p-4 mb-2">
          <View className="flex-row items-center border-r border-gray-200 pr-5 mr-5">
             <Text className="text-xs text-gray-400 font-bold mr-2 uppercase tracking-wide">Lot Area</Text>
             <Text className="text-lg font-bold text-orange-500">{property?.lotArea} <Text className="text-xs font-semibold text-orange-400">SQM</Text></Text>
          </View>
          
          <View className="flex-row flex-wrap flex-1 gap-2 pt-2 pb-2">
            {(property?.features || []).map((feature, index) => (
              <Pill
                key={`feat-${index}`}
                text={feature.name}
                icon={FEATURE_ICONS[feature.key] ?? FEATURE_ICONS[EMPTY_ICON_KEY]}
                iconSize={16}
                textSize="text-xs"
              />
            ))}
            {(property?.amenities || []).map((amenity, index) => (
              <Pill
                key={`ame-${index}`}
                text={amenity.name}
                icon={AMENITY_ICONS[amenity.key] ?? AMENITY_ICONS[EMPTY_ICON_KEY]}
                iconSize={16}
                textSize="text-xs"
                backGroundColor="bg-green-600"
              />
            ))}
          </View>
        </View>

        {/* Description */}
        <View>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            About this property
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed">
            {property?.details}
          </Text>
        </View>

        {/* Action Button */}
        <View className="mt-4">
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-3.5 shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors"
            activeOpacity={0.8}
            onPress={() => console.log("Inquire button pressed", property?.id)}
          >
            <Text className="text-base font-bold text-white text-center tracking-wide">
              Send Inquiry
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}
