import { color } from "@/app/theme/color";
import { size } from "@/app/theme/size";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, TextInput, View } from "react-native";

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isListView: boolean;
  setListView: (isListView: boolean) => void;
}

export function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  isListView,
  setListView,
}: SearchAndFiltersProps) {
  return (
    <View className={`flex-row ${color.bgWhite} px-4 py-3 #`}>
      <TextInput
        className={
          `flex-1 border ${color.borderGray} px-3 py-2 mr-2 rounded-lg`
        }
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable className="h-12 w-12 items-center justify-center rounded-full">
        <Feather name="filter" color={color.featherColorPrimary} size={size.featherIconPrimary} />
      </Pressable>

      {/* To Do: Add Toggle for Grid/List View */}
      <Pressable
        className="h-12 w-12 items-center justify-center rounded-full"
        onPress={() => setListView(!isListView)}
      >
        <Feather name={!isListView ? "list" : "grid"} color={color.featherColorPrimary} size={size.featherIconPrimary} />
      </Pressable>
    </View>
  );
}
export default SearchAndFilters;
