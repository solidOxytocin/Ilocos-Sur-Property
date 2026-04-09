import GridViewCardProperty from "@/app/modules/property-list/components/gridViewCardProperty";
import ListViewCardProperty from "@/app/modules/property-list/components/listViewCardProperty";
import SearchAndFilters from "@/app/modules/property-list/components/searchAndFilters";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  useWindowDimensions,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockProperties, Property } from "../constants/mock/mock-properties";
import { getPropertiesPaginated } from "../service/property-service";
import PropertyDetailsContent from "../modules/details-view/components/propertyDetailsContent";
import { FilterModal, FilterState } from "../modules/property-list/components/filterModal";

const PAGE_SIZE = 12;

export default function PropertyList() {
  const [isListView, setIsListView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    minPrice: 0,
    maxPrice: 0,
    city: "",
    minArea: 0,
    maxArea: 0,
  });

  const hasActiveFilters = useMemo(
    () =>
      filters.type.length > 0 ||
      filters.status.length > 0 ||
      filters.city !== "" ||
      filters.minPrice > 0 ||
      (filters.maxPrice > 0 && filters.maxPrice < 50000000) ||
      filters.minArea > 0 ||
      (filters.maxArea > 0 && filters.maxArea < 10000),
    [filters]
  );

  const quickFilters = [
    { label: "Available", key: "status", value: "AVAILABLE" },
    { label: "House", key: "type", value: "HOUSE" },
    { label: "Lot", key: "type", value: "LOT" },
    { label: "Condo", key: "type", value: "CONDO" },
    { label: "Commercial", key: "type", value: "COMMERCIAL" },
  ];

  const handleQuickFilterToggle = (key: "type" | "status", value: string) => {
    setFilters((prev) => {
      const arr = prev[key];
      return arr.includes(value)
        ? { ...prev, [key]: arr.filter((i) => i !== value) }
        : { ...prev, [key]: [...arr, value] };
    });
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Build Prisma-compatible filter object
  const buildFetchFilters = useCallback((): Record<string, any> => {
    const f: Record<string, any> = {};
    if (debouncedSearchQuery) f.searchQuery = debouncedSearchQuery;
    if (filters.type.length > 0) f.type = filters.type;
    if (filters.status.length > 0) f.status = filters.status;
    if (filters.city) f.city = filters.city;
    if (filters.minPrice > 0) f.minPrice = filters.minPrice;
    if (filters.maxPrice > 0) f.maxPrice = filters.maxPrice;
    if (filters.minArea > 0) f.minArea = filters.minArea;
    if (filters.maxArea > 0) f.maxArea = filters.maxArea;
    return f;
  }, [debouncedSearchQuery, filters]);

  // ── Initial / filter-change load (page 1) ──────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchFirstPage() {
      setLoading(true);
      setProperties([]);
      setCurrentPage(1);

      if (process.env.EXPO_PUBLIC_IS_MOCK === "true") {
        if (!cancelled) {
          setProperties(mockProperties);
          setTotal(mockProperties.length);
          setTotalPages(1);
          setLoading(false);
        }
        return;
      }

      const result = await getPropertiesPaginated(buildFetchFilters(), 1, PAGE_SIZE);
      if (!cancelled) {
        setProperties(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setCurrentPage(1);
        setLoading(false);
      }
    }

    fetchFirstPage();
    return () => { cancelled = true; };
  }, [debouncedSearchQuery, filters]);

  // ── Append next page on scroll-to-end ─────────────────────────────────────
  const loadNextPage = useCallback(async () => {
    if (loadingMore || loading || currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    const result = await getPropertiesPaginated(buildFetchFilters(), nextPage, PAGE_SIZE);
    setProperties((prev) => [...prev, ...result.data]);
    setCurrentPage(nextPage);
    setTotalPages(result.totalPages);
    setLoadingMore(false);
  }, [loadingMore, loading, currentPage, totalPages, buildFetchFilters]);

  // ── Layout ─────────────────────────────────────────────────────────────────
  const { width } = useWindowDimensions();
  const isWebDesktop = width >= 1024;
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  const selectedProperty = useMemo(
    () => (selectedPropertyId ? properties.find((p) => p.id === selectedPropertyId) ?? null : null),
    [selectedPropertyId, properties]
  );

  const numColumns = isListView
    ? 1
    : width > 1200
    ? 5
    : width > 1000
    ? 4
    : width > 800
    ? 3
    : 2;

  const renderItem = ({ item }: { item: Property }) =>
    isListView ? (
      <ListViewCardProperty
        property={item}
        onPress={isWebDesktop ? () => setSelectedPropertyId(item.id) : undefined}
      />
    ) : (
      <GridViewCardProperty property={item} />
    );

  // Footer: spinner while fetching more, "end of results" when fully loaded
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#1d4ed8" />
          <Text className="text-xs text-gray-400 mt-2">Loading more properties…</Text>
        </View>
      );
    }
    if (!loading && properties.length > 0 && currentPage >= totalPages && totalPages > 0) {
      return (
        <View className="py-4 items-center">
          <View className="flex-row items-center gap-2">
            <View className="h-px flex-1 bg-gray-200" />
            <Text className="text-xs text-gray-400 px-2">
              {total} propert{total === 1 ? "y" : "ies"} shown
            </Text>
            <View className="h-px flex-1 bg-gray-200" />
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 flex-row px-2 pt-3">
        {/* ── Main list / grid ────────────────────────────────────── */}
        <View className="flex-1">
          {/* Search + Quick Filters */}
          <View className="mb-2">
            <SearchAndFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isListView={isListView}
              setListView={setIsListView}
              onOpenFilters={() => setIsFilterModalVisible(true)}
              hasActiveFilters={hasActiveFilters}
            />
            <View className="px-4 py-2 bg-white border-t border-gray-100">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quickFilters.map((qf) => {
                  const isActive = filters[qf.key as "type" | "status"].includes(qf.value);
                  return (
                    <Pressable
                      key={qf.value}
                      onPress={() =>
                        handleQuickFilterToggle(qf.key as "type" | "status", qf.value)
                      }
                      className={`px-4 py-2 mr-2 rounded-full border ${
                        isActive
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Text
                        className={
                          isActive
                            ? "text-white font-medium text-sm"
                            : "text-gray-600 text-sm"
                        }
                      >
                        {qf.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* List Body */}
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
            <View
              className={
                isListView
                  ? "flex-1"
                  : "flex-1 justify-center items-center w-full"
              }
            >
              <FlatList
                key={numColumns + (isListView ? "-list" : "-grid")}
                data={properties}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                numColumns={numColumns}
                showsVerticalScrollIndicator={false}
                className={isListView ? "w-full" : ""}
                onEndReached={loadNextPage}
                onEndReachedThreshold={0.4}
                ListFooterComponent={renderFooter}
              />
            </View>
          )}
        </View>

        {/* ── Web split-view details panel ────────────────────────── */}
        {isWebDesktop && isListView && (
          <>
            <View className="w-[1px] bg-gray-300 mx-2" />
            <View className="w-2/3 bg-white rounded-lg shadow-sm shadow-gray-200 overflow-hidden mb-2">
              {selectedProperty ? (
                <PropertyDetailsContent
                  property={selectedProperty}
                  onClose={() => setSelectedPropertyId(null)}
                />
              ) : (
                <View className="flex-1 justify-center items-center h-full">
                  <Text className="text-xl text-gray-400">
                    Select a Property to View Details
                  </Text>
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