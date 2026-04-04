import GridViewCardProperty from "@/app/modules/property-list/components/gridViewCardProperty";
import ListViewCardProperty from "@/app/modules/property-list/components/listViewCardProperty";
import SearchAndFilters from "@/app/modules/property-list/components/searchAndFilters";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, useWindowDimensions, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  mockProperties,
  Property,
} from "../constants/mock/mock-properties";
import { getProperties } from "../service/property-service";
import PropertyDetailsContent from "../modules/details-view/components/propertyDetailsContent";
import { FilterModal, FilterState } from "../modules/property-list/components/filterModal";

export default function PropertyList() {
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    minPrice: 0,
    maxPrice: 0,
    city: '',
    minArea: 0,
    maxArea: 0,
  });

  const hasActiveFilters = useMemo(() => {
    return filters.type.length > 0 || 
           filters.status.length > 0 || 
           filters.city !== '' || 
           filters.minPrice > 0 || 
           (filters.maxPrice > 0 && filters.maxPrice < 50000000) || 
           filters.minArea > 0 || 
           (filters.maxArea > 0 && filters.maxArea < 10000);
  }, [filters]);

  const quickFilters = [
    { label: 'Available', key: 'status', value: 'AVAILABLE' },
    { label: 'House', key: 'type', value: 'HOUSE' },
    { label: 'Lot', key: 'type', value: 'LOT' },
    { label: 'Condo', key: 'type', value: 'CONDO' },
    { label: 'Commercial', key: 'type', value: 'COMMERCIAL' },
  ];

  const handleQuickFilterToggle = (key: 'type' | 'status', value: string) => {
    setFilters(prev => {
      const arr = prev[key];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter(i => i !== value) };
      } else {
        return { ...prev, [key]: [...arr, value] };
      }
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(()=>{
    async function fetchData() {
      setLoading(true);
      if (process.env.EXPO_PUBLIC_IS_MOCK === "true") {
        setProperties(mockProperties);
      } else {
        const fetchFilters: Record<string, any> = {};
        if (debouncedSearchQuery) {
            fetchFilters.searchQuery = debouncedSearchQuery;
        }
        if (filters.type.length > 0) fetchFilters.type = filters.type;
        if (filters.status.length > 0) fetchFilters.status = filters.status;
        if (filters.city) fetchFilters.city = filters.city;
        if (filters.minPrice > 0) fetchFilters.minPrice = filters.minPrice;
        if (filters.maxPrice > 0) fetchFilters.maxPrice = filters.maxPrice;
        if (filters.minArea > 0) fetchFilters.minArea = filters.minArea;
        if (filters.maxArea > 0) fetchFilters.maxArea = filters.maxArea;

        const data = await getProperties(fetchFilters);
        setProperties(data);
      }
      setLoading(false)
    }
     fetchData();
  },[debouncedSearchQuery, filters])

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
              onOpenFilters={() => setIsFilterModalVisible(true)}
              hasActiveFilters={hasActiveFilters}
            />
            {/* Quick Filters */}
            <View className="px-4 py-2 bg-white border-t border-gray-100">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                 {quickFilters.map((qf) => {
                   const isActive = filters[qf.key as 'type' | 'status'].includes(qf.value);
                   return (
                     <Pressable
                       key={qf.value}
                       onPress={() => handleQuickFilterToggle(qf.key as 'type' | 'status', qf.value)}
                       className={`px-4 py-2 mr-2 rounded-full border ${isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                     >
                       <Text className={isActive ? 'text-white font-medium text-sm' : 'text-gray-600 text-sm'}>{qf.label}</Text>
                     </Pressable>
                   );
                 })}
              </ScrollView>
            </View>
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#1d4ed8" />
            </View>
          ) : properties.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text className="text-lg text-gray-500">
                No properties found matching your search.
              </Text>
            </View>
          ) : (
            <View className={isListView ? "flex-1" : "flex-1 justify-center items-center w-full"}>
              <FlatList
                key={numColumns + (isListView ? "-list" : "-grid")}
                data={properties}
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
      <FilterModal 
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </SafeAreaView>
  );
}