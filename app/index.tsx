import React, { useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GridViewCardProperty from "./properties/components/gridViewCardProperty";
import { Header } from "./properties/components/header";
import { ListViewCardProperty } from "./properties/components/listViewCardProperty";
import { SearcAndFilters } from "./properties/components/searcAndFilters";
import {
  mockProperties,
  Property,
} from "./properties/constants/mock-properties";
export default function PropertiesScreen() {
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter properties based on search query
  const data = mockProperties;
  const filteredProperties = data.filter((property) =>
    property.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Render property item based on current view mode
  const renderItem = ({ item }: { item: Property }) => {
    if (isListView) {
      return <ListViewCardProperty property={item} />;
    } else {
      return <GridViewCardProperty property={item} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}

      <Header isListView={isListView} setIsListView={setIsListView} />

      <SearcAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isListView={isListView}
        setListView={setIsListView}
      />

      {/* Property List/Grid in renderItem */}
      <FlatList
        key={isListView ? "list" : "grid"}
        data={filteredProperties}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={isListView ? 1 : 3}
        columnWrapperStyle={isListView ? "" : { justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
