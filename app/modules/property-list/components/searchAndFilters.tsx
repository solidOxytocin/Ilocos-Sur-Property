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
  const isGrid = !isListView;
  const isWeb = Platform.OS === "web";
  const isWebGrid = isWeb && isGrid;
  
  return (
    <View className="bg-blue-700 shadow-lg px-4 py-4">
      <View className={`flex-row items-center w-full ${isWebGrid ? 'justify-center max-w-6xl mx-auto' : ''}`}>
        
        {isWebGrid && (
          <View className="flex-row items-center mr-4">
            <Image
              source={require("../../../../assets/images/ilocos-sur-icon-white.png")}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
              
            />
            <Text className="text-white text-2xl font-bold ml-4">Ilocos Sur {"\n"} Property</Text>
          </View>
        )}

        <TextInput
          className={`px-4 py-3 mr-3 rounded-xl flex-1 border border-white bg-white text-gray-900 ${isWebGrid ? 'max-w-2xl mx-4' : ''}`}
          placeholder="Search properties..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <Pressable 
          onPress={onOpenFilters} 
          className="h-12 w-12 items-center justify-center rounded-xl mr-2 relative bg-white/20"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
          <Feather name="filter" color="#fff" size={20} />
          {hasActiveFilters && (
              <View className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-700" />
          )}
        </Pressable>

        <Pressable
          className="h-12 w-12 items-center justify-center rounded-xl bg-white/20"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          onPress={() => setListView(!isListView)}
        >
          <Feather name={!isListView ? "list" : "grid"} color="#fff" size={20} />
        </Pressable>
      </View>
    </View>
  );
}
export default SearchAndFilters;
