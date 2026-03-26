import GridViewCardProperty from "@/app/modules/property-list/components/gridViewCardProperty";
import ListViewCardProperty from "@/app/modules/property-list/components/listViewCardProperty";
import SearchAndFilters from "@/app/modules/property-list/components/searchAndFilters";
import { useEffect, useState } from "react";
import { FlatList, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  mockProperties,
  Property,
} from "../constants/mock/mock-properties";
import { PROPERTY } from "../constants/paths";
import { getProperties } from "../service/property-service";

export  default function PropertyList() {
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function fetchData() {
      if(process.env.EXPO_PUBLIC_IS_MOCK){
        setProperties(mockProperties)
      }
      else{
        const data = await getProperties();
        setProperties(data)
      }
     
      console.log("Properties", properties)
      setLoading(false)
    }
     fetchData();
  },[])
  // Filter properties based on search query


  const filteredProperties = properties.filter(
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

 