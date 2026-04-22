import { size } from "@/app/theme/size";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, TextInput, View, Image, Platform, Text, useWindowDimensions } from "react-native";

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
  const { width } = useWindowDimensions();
  const isWebGrid = Platform.OS === "web" && !isListView;
  const showFullTitle = width >= 768; // Show full title on tablet/desktop

  return (
    <View className={`flex-row bg-white px-4 py-3 items-center ${isWebGrid ? 'border-b border-gray-100 shadow-sm' : ''}`}>
      {isWebGrid && (
        <View className="flex-row items-center mr-4">
          <Image
            source={require("../../../../assets/images/ilocos-sur-icon.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
          {showFullTitle && (
            <Text className="ml-2 font-bold text-lg text-gray-700">
              {width >= 1024 ? "Ilocos Sur \n Property" : "ISP"}
            </Text>
          )}
        </View>
      )}

      <TextInput
        className="flex-1 border border-gray-200 bg-gray-50 px-4 py-2 mr-3 rounded-lg"
        placeholder="Search properties..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Pressable onPress={onOpenFilters} className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 mr-2 relative">
        <Feather name="filter" color="#4b5563" size={18} />
        {hasActiveFilters && (
            <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
        )}
      </Pressable>

      <Pressable
        className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        onPress={() => setListView(!isListView)}
      >
        <Feather name={!isListView ? "list" : "grid"} color="#4b5563" size={18} />
      </Pressable>
    </View>
  );
}
export default SearchAndFilters;
