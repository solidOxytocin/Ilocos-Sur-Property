import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { MaterialIconName } from "../../property-list/constants/material-icon-names";

interface PillProps {
  text: string;
  textColor?: string;
  icon: MaterialIconName;
  iconSize?: number;
  iconColor?: string;
  textSize?: string;
  weight?: string;
  backGroundColor?: string;
  compact?: boolean;
}

export default function Pill({
  text,
  textColor,
  icon,
  iconSize = 11,
  iconColor = "#fff",
  textSize = "text-xs",
  weight = "font-semibold",
  backGroundColor,
  compact = false,
}: PillProps) {


  return (
    <View
      className={`flex-row items-center gap-1 ${compact ? 'px-2 py-0.5 ml-1 mr-0.5' : 'px-3 py-1.5 ml-2 mr-1'} ${backGroundColor || "bg-blue-700"} rounded-full`}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
      <Text
        className={`${textSize || "text-xs"} ${textColor || "text-white"} ${weight || "font-semibold"}`}
      >
        {text}
      </Text>
    </View>
  );
}
