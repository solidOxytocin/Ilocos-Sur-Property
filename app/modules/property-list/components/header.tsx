import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

interface HeaderProps {
  isListView?: boolean;
  setIsListView?: (value: boolean) => void;
}

export function Header({ isListView, setIsListView }: HeaderProps) {
  return (
    <View className="flex-row px-4 py-3 border-b border-gray-200 ">
      <Pressable className=" justify-center items-center " onPress={() => {}}>
        <Feather name="menu" size={20} color="black" className="border-0" />
      </Pressable>
      {/* <Text className=" font-bold text-lg flex-1  text-center color-blue-600">Properties</Text> */}
    </View>
  );
}

export default Header;
