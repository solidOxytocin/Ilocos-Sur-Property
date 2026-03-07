import GridViewCardProperty from "@/app/modules/property-list/components/gridViewCardProperty";
import ListViewCardProperty from "@/app/modules/property-list/components/listViewCardProperty";
import SearchAndFilters from "@/app/modules/property-list/components/searchAndFilters";
import { useState } from "react";
import { FlatList, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  mockProperties,
  Property,
} from "../modules/property-list/constants/mock-properties";

export default function PropertyList() {
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter properties based on search query
  const data = mockProperties;
  const filteredProperties = data.filter(
    (property) =>
      property.location.city
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      property.location.barangay
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      property.location.address
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      property.price
        .toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      property.lotArea
        ?.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  // Render property item based on current view mode
  const renderItem = ({ item }: { item: Property }) => {
    if (isListView) {
      return <ListViewCardProperty property={item} />;
    } else {
      return <GridViewCardProperty property={item} />;
    }
  };
  const width = useWindowDimensions().width;
  const numColumns = isListView
    ? 1
    : width > 1200
      ? 5
      : width > 1000
        ? 4
        : width > 800
          ? 3
          : 2;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}

      {/* <Header isListView={isListView} setIsListView={setIsListView} /> */}

      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isListView={isListView}
        setListView={setIsListView}
      />

      {/* Property List/Grid in renderItem */}
      <View className="flex-1 flexjustify-center items-center mt-3">
        <FlatList
          key={numColumns}
          data={filteredProperties}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
