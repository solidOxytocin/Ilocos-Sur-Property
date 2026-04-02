import { size } from "@/app/theme/size";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Property } from "../../../constants/mock/mock-properties";

interface HeaderProps {
  properties: Property;
}

export default function DetailsHeader({ properties }: HeaderProps) {
  return (
    <View className="flex-row px-4 py-3 border border-gray-200">
      <TouchableOpacity
        className="mr-4"
        onPress={() => {
          router.back();
        }}
      >
        <MaterialCommunityIcons name="arrow-left" size={size.headerIcon} color="black" />
      </TouchableOpacity>
      <Text className="text-xl font-bold flex-1 text-center text-blue-600">
        {properties.location.city} | {properties.location.barangay}
      </Text>
    </View>
  );
}
