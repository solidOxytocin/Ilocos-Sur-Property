import { size } from "@/app/theme/size";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, TextInput, View } from "react-native";

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isListView: boolean;
  setListView: (isListView: boolean) => void;
  onOpenFilters: () => void;
  hasActiveFilters: boolean;
}

export function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  isListView,
  setListView,
  onOpenFilters,
  hasActiveFilters,
}: SearchAndFiltersProps) {
  return (
    <View className="flex-row bg-white px-4 py-3">
      <TextInput
        className="flex-1 border border-gray-200 px-3 py-2 mr-2 rounded-lg"
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable onPress={onOpenFilters} className="h-12 w-12 items-center justify-center rounded-full relative">
        <Feather name="filter" color="blue" size={size.featherIconPrimary} />
        {hasActiveFilters && (
            <View className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-white" />
        )}
      </Pressable>

      {/* To Do: Add Toggle for Grid/List View */}
      <Pressable
        className="h-12 w-12 items-center justify-center rounded-full"
        onPress={() => setListView(!isListView)}
      >
        <Feather name={!isListView ? "list" : "grid"} color="blue" size={size.featherIconPrimary} />
      </Pressable>
    </View>
  );
}
export default SearchAndFilters;
