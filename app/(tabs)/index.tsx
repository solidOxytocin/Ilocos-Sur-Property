import GridViewCardProperty from "@/app/modules/property-list/components/gridViewCardProperty";
import ListViewCardProperty from "@/app/modules/property-list/components/listViewCardProperty";
import SearchAndFilters from "@/app/modules/property-list/components/searchAndFilters";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  mockProperties,
  Property,
} from "../constants/mock/mock-properties";
import { PROPERTY } from "../constants/paths";
import { getProperties } from "../service/property-service";
import PropertyDetailsContent from "../modules/details-view/components/propertyDetailsContent";

export  default function PropertyList() {
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    async function fetchData() {
       console.log("is MOCK: ", process.env.EXPO_PUBLIC_IS_MOCK)
      if(process.env.EXPO_PUBLIC_IS_MOCK){
        setProperties(mockProperties)
      }
      else{
        const data = await getProperties();
        setProperties(data)
      }
     
     
      setLoading(false)
    }
     fetchData();
  },[])
  // Filter properties based on search query

  const filteredProperties = useMemo(() => {
  return properties.filter((property) =>
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
}, [properties, searchQuery]);

  const width = useWindowDimensions().width;
  const isWebDesktop = width >= 1024;
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const selectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, properties]);

  // Render property item based on current view mode
  const renderItem = ({ item }: { item: Property }) => {
    if (isListView) {
      return (
        <ListViewCardProperty 
          property={item} 
          onPress={isWebDesktop ? () => setSelectedPropertyId(item.id) : undefined}
        />
      );
    } else {
      return <GridViewCardProperty property={item} />;
    }
  };

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
      <View className="flex-1 flex-row px-2 pt-3">
        {/* Main List/Grid Area */}
        <View className="flex-1">
          <View className="mb-2">
            <SearchAndFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isListView={isListView}
              setListView={setIsListView}
            />
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#1d4ed8" />
            </View>
          ) : filteredProperties.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg text-gray-500">
                No properties found matching your search.
              </Text>
            </View>
          ) : (
            <View className={isListView ? "flex-1" : "flex-1 justify-center items-center w-full"}>
              <FlatList
                key={numColumns + (isListView ? "-list" : "-grid")}
                data={filteredProperties}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={numColumns}
                showsVerticalScrollIndicator={false}
                className={isListView ? "w-full" : ""}
              />
            </View>
          )}
        </View>

        {/* Web Split View Details Panel */}
        {isWebDesktop && isListView && (
          <>
            {/* Divider */}
            <View className="w-[1px] bg-gray-300 mx-2" />
            
            <View className="w-2/3 bg-white rounded-lg shadow-sm shadow-gray-200 overflow-hidden mb-2">
              {selectedProperty ? (
                <PropertyDetailsContent 
                  property={selectedProperty} 
                  onClose={() => setSelectedPropertyId(null)}
                />
              ) : (
                <View className="flex-1 justify-center items-center h-full">
                  <Text className="text-xl text-gray-400">Select a Property to View Details</Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

 