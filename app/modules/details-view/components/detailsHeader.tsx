import { size } from "@/app/theme/size";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Property } from "../../../constants/mock/mock-properties";

interface HeaderProps {
  properties: Property;
  onClose?: () => void;
}

export default function DetailsHeader({ properties, onClose }: HeaderProps) {
  return (
    <View className="flex-row px-4 py-3 border-b border-gray-200 items-center">
      {onClose ? (
        <TouchableOpacity
          className="mr-4"
          onPress={onClose}
        >
          <MaterialCommunityIcons name="close" size={size.headerIcon} color="black" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="mr-4"
          onPress={() => {
            router.back();
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={size.headerIcon} color="black" />
        </TouchableOpacity>
      )}
      <Text className="text-xl font-bold flex-1 text-center text-blue-600">
        {properties.location.city} | {properties.location.barangay}
      </Text>
      {/* Empty view to balance the flex-row if needed, but flex-1 text-center handles centering mostly */}
      <View className="w-8" />
    </View>
  );
}
