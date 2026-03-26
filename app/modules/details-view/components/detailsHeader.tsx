import { color } from "@/app/theme/color";
import { size } from "@/app/theme/size";
import { typography } from "@/app/theme/typography";
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
    <View className={`flex-row px-4 py-3 border ${color.borderGray}` }>
      <TouchableOpacity
        className="mr-4"
        onPress={() => {
          router.back();
        }}
      >
        <MaterialCommunityIcons name="arrow-left" size={size.headerIcon} color={color.iconBlack} />
      </TouchableOpacity>
      <Text className={`${typography.title.size} ${typography.title.weight} flex-1  text-center ${color.txtBlue}`}>
        {properties.location.city} | {properties.location.barangay}
      </Text>
    </View>
  );
}
