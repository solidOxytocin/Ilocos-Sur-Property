import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { MaterialIconName } from "../../property-list/constants/material-icon-names";

interface PillProps {
  text: string;
  icon: MaterialIconName;
  iconSize?: number;
  iconColor?: string;
  textSize?: string;
  font?: string;
}

export default function Pill({
  text,
  icon,
  iconSize = 11,
  iconColor = "#fff",
  textSize = "xs",
  font = "semi-bold",
}: PillProps) {
  return (
    <View className="flex-row items-center px-3 gap-1 py-1.5 bg-blue-700 rounded-full ml-2">
      <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
      <Text
        className={`text-${textSize || "xs"} text-white font-${font || "semi-bold"}`}
      >
        {text}
      </Text>
    </View>
  );
}
