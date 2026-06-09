import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, TextInput, View, Image, Platform, Text, useWindowDimensions } from "react-native";

interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isListView: boolean;
  setListView: (isListView: boolean) => void;
  onOpenFilters: () => void;
  hasActiveFilters: boolean;
  /** Stack controls for narrow web split-view list column. */
  compact?: boolean;
}

export function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  isListView,
  setListView,
  onOpenFilters,
  hasActiveFilters,
  compact = false,
}: SearchAndFiltersProps) {
  const { width } = useWindowDimensions();
  const isGrid = !isListView;
  const isWeb = Platform.OS === "web";
  const isWebGrid = isWeb && isGrid;
  const isWebGridMobile = isWebGrid && width < 768;
  const showListViewToggle = width >= 768;
  const iconButtonSize = compact || isWebGridMobile ? "h-10 w-10" : "h-12 w-12";
  const iconSize = compact || isWebGridMobile ? 18 : 20;

  const filterToggleButtons = (
    <View className="flex-row items-center shrink-0">
      <Pressable
        onPress={onOpenFilters}
        className={`${iconButtonSize} ${showListViewToggle ? "mr-2" : ""} items-center justify-center rounded-xl relative bg-white/20`}
        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
      >
        <Feather name="filter" color="#fff" size={iconSize} />
        {hasActiveFilters && (
          <View className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-700" />
        )}
      </Pressable>

      {showListViewToggle ? (
        <Pressable
          className={`${iconButtonSize} items-center justify-center rounded-xl bg-white/20`}
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          onPress={() => setListView(!isListView)}
        >
          <Feather name={!isListView ? "list" : "grid"} color="#fff" size={iconSize} />
        </Pressable>
      ) : null}
    </View>
  );

  if (isWebGridMobile) {
    return (
      <View className="bg-blue-700 shadow-lg px-3 py-3">
        <View className="flex-row items-center justify-between mb-3 min-w-0">
          <Pressable onPress={() => router.push("/")} className="flex-row items-center flex-1 min-w-0 mr-2">
            <Image
              source={require("../../../../assets/images/ilocos-sur-icon-white.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
            <Text className="text-white text-base font-bold ml-2 shrink" numberOfLines={1}>
              Ilocos Sur Property
            </Text>
          </Pressable>
          {filterToggleButtons}
        </View>
        <TextInput
          className="w-full rounded-xl border border-white bg-white text-gray-900 px-3 py-2.5 text-sm"
          placeholder="Search properties..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    );
  }

  return (
    <View className={`bg-blue-700 shadow-lg ${compact ? "px-2 py-3" : "px-4 py-4"}`}>
      <View
        className={`flex-row items-center w-full min-w-0 ${
          isWebGrid ? "justify-center max-w-6xl mx-auto" : ""
        }`}
      >
        {isWebGrid && (
          <Pressable onPress={() => router.push("/")} className="shrink-0">
            <View className="flex-row items-center mr-4">
              <Image
                source={require("../../../../assets/images/ilocos-sur-icon-white.png")}
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
              <Text className="text-white text-2xl font-bold ml-4">Ilocos Sur {"\n"} Property</Text>
            </View>
          </Pressable>
        )}

        <TextInput
          className={`rounded-xl flex-1 min-w-0 border border-white bg-white text-gray-900 ${
            compact ? "px-3 py-2.5 text-sm mr-2" : `px-4 py-3 mr-3 ${isWebGrid ? "max-w-2xl mx-4" : ""}`
          }`}
          placeholder="Search properties..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {filterToggleButtons}
      </View>
    </View>
  );
}
export default SearchAndFilters;
