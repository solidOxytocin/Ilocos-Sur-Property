import GridViewCardProperty from "@/app/modules/property-list/components/gridViewCardProperty";
import ListViewCardProperty from "@/app/modules/property-list/components/listViewCardProperty";
import SearchAndFilters from "@/app/modules/property-list/components/searchAndFilters";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mockProperties, Property } from "../constants/mock/mock-properties";
import { getPropertiesPaginated } from "../service/property-service";
import PropertyDetailsContent from "../modules/details-view/components/propertyDetailsContent";
import { FilterModal, FilterState } from "../modules/property-list/components/filterModal";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

const PAGE_SIZE = 12;

type SortField = "createdAt" | "price" | "lotArea" | "city";
type SortOrder = "asc" | "desc";

const SORT_FIELDS: { label: string; field: SortField }[] = [
  { label: "Newest",  field: "createdAt" },
  { label: "Price", field: "price" },
  { label: "Area",  field: "lotArea" },
  { label: "City",  field: "city" },
];

// Client-side sort for mock mode
function sortMockProperties(list: Property[], field: SortField, order: SortOrder): Property[] {
  return [...list].sort((a, b) => {
    let av: any = a[field as keyof Property] ?? "";
    let bv: any = b[field as keyof Property] ?? "";
    if (field === "createdAt") { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
    if (typeof av === "string") return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return order === "asc" ? av - bv : bv - av;
  });
}

export default function PropertyList() {
  const { id: preselectedId, city: preselectedCity, type: preselectedType, status: preselectedStatus } =
    useLocalSearchParams<{ id?: string; city?: string; type?: string; status?: string }>();

  const [isListView, setIsListView]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);

  // Sort state — null means no active sort
  const [sortField, setSortField] = useState<SortField | null>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSortChipPress = (field: SortField) => {
    const defaultOrder = field === "createdAt" ? "desc" : "asc";
    const toggleOrder = field === "createdAt" ? "asc" : "desc";

    if (sortField !== field) {
      // Activate this field with its default order
      setSortField(field);
      setSortOrder(defaultOrder);
    } else if (sortOrder === defaultOrder) {
      // Cycle to the toggled order
      setSortOrder(toggleOrder);
    } else {
      // Was in the toggled order — clear sort
      setSortField(null);
    }
  };

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: [], status: [], minPrice: 0, maxPrice: 0, city: "", minArea: 0, maxArea: 0,
  });

  const hasActiveFilters = useMemo(
    () =>
      filters.type.length > 0 || filters.status.length > 0 || filters.city !== "" ||
      filters.minPrice > 0 || (filters.maxPrice > 0 && filters.maxPrice < 50000000) ||
      filters.minArea > 0 || (filters.maxArea > 0 && filters.maxArea < 10000),
    [filters]
  );

  const quickFilters = [
    { label: "Available", key: "status", value: "AVAILABLE" },
    { label: "House",     key: "type",   value: "HOUSE" },
    { label: "Lot",       key: "type",   value: "LOT" },
    { label: "Condo",     key: "type",   value: "CONDO" },
    { label: "Commercial",key: "type",   value: "COMMERCIAL" },
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
    const h = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(h);
  }, [searchQuery]);

  // Build filter + sort params
  const buildFetchFilters = useCallback((): Record<string, any> => {
    const f: Record<string, any> = {};
    if (debouncedSearchQuery) f.searchQuery = debouncedSearchQuery;
    if (filters.type.length > 0)   f.type     = filters.type;
    if (filters.status.length > 0) f.status   = filters.status;
    if (filters.city)              f.city     = filters.city;
    if (filters.minPrice > 0)      f.minPrice = filters.minPrice;
    if (filters.maxPrice > 0)      f.maxPrice = filters.maxPrice;
    if (filters.minArea > 0)       f.minArea  = filters.minArea;
    if (filters.maxArea > 0)       f.maxArea  = filters.maxArea;
    if (sortField) { f.sortBy = sortField; f.sortOrder = sortOrder; }
    return f;
  }, [debouncedSearchQuery, filters, sortField, sortOrder]);

  // ── Load page 1 whenever filters / sort change ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchFirstPage() {
      setLoading(true);
      setProperties([]);
      setCurrentPage(1);
     
      if (process.env.EXPO_PUBLIC_IS_MOCK === "true") {
        // Apply client-side filter + sort on mock data
        let filtered = mockProperties.filter((p) => {
          if (filters.type.length > 0 && !filters.type.map(t => t.toLowerCase()).includes(p.type)) return false;
          if (filters.status.length > 0 && !filters.status.map(s => s.toLowerCase()).includes(p.status)) return false;
          if (filters.city && !p.location?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
          if (filters.minPrice > 0 && p.price < filters.minPrice) return false;
          if (filters.maxPrice > 0 && p.price > filters.maxPrice) return false;
          if (filters.minArea > 0 && (p.lotArea ?? 0) < filters.minArea) return false;
          if (filters.maxArea > 0 && (p.lotArea ?? 0) > filters.maxArea) return false;
          if (debouncedSearchQuery) {
            const q = debouncedSearchQuery.toLowerCase();
            return (
              p.title?.toLowerCase().includes(q) ||
              p.location?.city?.toLowerCase().includes(q) ||
              p.location?.barangay?.toLowerCase().includes(q)
            );
          }
          return true;
        });
        if (sortField) filtered = sortMockProperties(filtered, sortField, sortOrder);
        const slice = filtered.slice(0, PAGE_SIZE);
        if (!cancelled) {
          setProperties(slice);
          setTotal(filtered.length);
          setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
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
  }, [debouncedSearchQuery, filters, sortField, sortOrder]);

  // ── Append next page on scroll-to-end ─────────────────────────────────────
  const loadNextPage = useCallback(async () => {
    if (loadingMore || loading || currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);

    if (process.env.EXPO_PUBLIC_IS_MOCK === "true") {
      // slice next page from already-sorted mock
      let filtered = mockProperties.filter((p) => {
        if (filters.type.length > 0 && !filters.type.map(t => t.toLowerCase()).includes(p.type)) return false;
        if (filters.status.length > 0 && !filters.status.map(s => s.toLowerCase()).includes(p.status)) return false;
        if (filters.city && !p.location?.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
        if (filters.minPrice > 0 && p.price < filters.minPrice) return false;
        if (filters.maxPrice > 0 && p.price > filters.maxPrice) return false;
        if (filters.minArea > 0 && (p.lotArea ?? 0) < filters.minArea) return false;
        if (filters.maxArea > 0 && (p.lotArea ?? 0) > filters.maxArea) return false;
        if (debouncedSearchQuery) {
          const q = debouncedSearchQuery.toLowerCase();
          return p.title?.toLowerCase().includes(q) || p.location?.city?.toLowerCase().includes(q) || p.location?.barangay?.toLowerCase().includes(q);
        }
        return true;
      });
      if (sortField) filtered = sortMockProperties(filtered, sortField, sortOrder);
      const slice = filtered.slice((nextPage - 1) * PAGE_SIZE, nextPage * PAGE_SIZE);
      setProperties(prev => [...prev, ...slice]);
      setCurrentPage(nextPage);
      setLoadingMore(false);
      return;
    }

    const result = await getPropertiesPaginated(buildFetchFilters(), nextPage, PAGE_SIZE);
    setProperties((prev) => [...prev, ...result.data]);
    setCurrentPage(nextPage);
    setTotalPages(result.totalPages);
    setLoadingMore(false);
  }, [loadingMore, loading, currentPage, totalPages, buildFetchFilters, filters, debouncedSearchQuery, sortField, sortOrder]);

  // ── Layout ─────────────────────────────────────────────────────────────────
  const { width } = useWindowDimensions();
  const isWebDesktop = width >= 1024;
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  // ── Auto-select property from URL param (e.g. /properties?id=3) ────────────
  useEffect(() => {
    if (Platform.OS !== "web" || !preselectedId) return;
    const numId = Number(preselectedId);
    if (!numId) return;
    // Switch to list view so the split-panel is visible
    setIsListView(true);
    setSelectedPropertyId(numId);
  }, [preselectedId]);

  // ── Pre-apply city filter from URL param (e.g. /properties?city=Vigan+City) ──
  useEffect(() => {
    if (Platform.OS !== "web" || !preselectedCity) return;
    setFilters((prev) => ({ ...prev, city: preselectedCity }));
  }, [preselectedCity]);

  // ── Pre-apply type / status filters from URL params ──────────────────────────
  useEffect(() => {
    if (Platform.OS !== "web") return;
    setFilters((prev) => ({
      ...prev,
      ...(preselectedType   ? { type:   [preselectedType]   } : {}),
      ...(preselectedStatus ? { status: [preselectedStatus] } : {}),
    }));
  }, [preselectedType, preselectedStatus]);

  const selectedProperty = useMemo(
    () => (selectedPropertyId ? properties.find((p) => p.id === selectedPropertyId) ?? null : null),
    [selectedPropertyId, properties]
  );

  const numColumns = isListView ? 1 : width > 1200 ? 5 : width > 1000 ? 4 : width > 800 ? 3 : 2;

  const renderItem = ({ item }: { item: Property }) =>
    isListView ? (
      <ListViewCardProperty
        property={item}
        onPress={isWebDesktop ? () => setSelectedPropertyId(item.id) : undefined}
      />
    ) : (
      <GridViewCardProperty property={item} />
    );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#1d4ed8" />
          <Text className="text-xs text-gray-400 mt-2">Loading more…</Text>
        </View>
      );
    }
    if (!loading && properties.length > 0 && currentPage >= totalPages && totalPages > 0) {
      return (
        <View className="py-4 items-center">
          <View className="flex-row items-center">
            <View className="h-px w-16 bg-gray-200" />
            <Text className="text-xs text-gray-400 px-3">
              {total} propert{total === 1 ? "y" : "ies"} shown
            </Text>
            <View className="h-px w-16 bg-gray-200" />
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 flex-row">
        {/* ── LEFT COLUMN (Header + List) ────────────────────────── */}
        <View className="flex-1">
          {/* Header spanning full width of left column */}
          <View className="bg-white z-10">
            <SearchAndFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isListView={isListView}
              setListView={setIsListView}
              onOpenFilters={() => setIsFilterModalVisible(true)}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Sort chips — one chip per field, arrow appears only when active */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8 }}>
              <MaterialIcons name="sort" size={16} color="#6b7280" />
              <Text style={{ fontSize: 11, fontWeight: '500', color: '#6b7280', marginLeft: 4, marginRight: 8 }}>Sort:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}
                style={{ flex: 1 }}
              >
                {SORT_FIELDS.map(({ label, field }) => {
                  const isActive = sortField === field;
                  // For the date field, swap the label to be semantically descriptive
                  const activeLabel =
                    field === 'createdAt' && isActive
                      ? (sortOrder === 'asc' ? 'Oldest' : 'Newest')
                      : label;
                  return (
                    <Pressable
                      key={field}
                      onPress={() => handleSortChipPress(field)}
                      style={[
                        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, borderRadius: 999, borderWidth: 1 },
                        isActive ? { backgroundColor: '#4f46e5', borderColor: '#4f46e5' } : { backgroundColor: '#fff', borderColor: '#e5e7eb' },
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '500', color: isActive ? '#fff' : '#6b7280' }}>
                        {activeLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quick filter chips */}
            <View style={{ backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, paddingBottom: 12 }}>
              <FlatList
                horizontal
                data={quickFilters}
                keyExtractor={(qf) => qf.value}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2 }}
                renderItem={({ item: qf }) => {
                  const isActive = filters[qf.key as "type" | "status"].includes(qf.value);
                  return (
                    <Pressable
                      onPress={() => handleQuickFilterToggle(qf.key as "type" | "status", qf.value)}
                      style={[
                        { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 999, borderWidth: 1 },
                        isActive ? { backgroundColor: '#2563eb', borderColor: '#2563eb' } : { backgroundColor: '#fff', borderColor: '#d1d5db' },
                      ]}
                    >
                      <Text style={{ fontSize: 13, fontWeight: isActive ? '600' : '400', color: isActive ? '#fff' : '#4b5563' }}>
                        {qf.label}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>
          </View>

          {/* List Body */}
          <View className="flex-1 px-2 pt-3">
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#1d4ed8" />
              </View>
            ) : properties.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-lg text-gray-500">No properties found matching your search.</Text>
              </View>
            ) : (
              <View className={isListView ? "flex-1" : "flex-1 justify-center items-center w-full"}>
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
        </View>

        {/* ── Web split-view details panel ────────────────────────── */}
        {isWebDesktop && isListView && (
          <>
            <View className="w-[1px] bg-gray-300 mx-2 my-3" />
            <View className="w-2/3 bg-white rounded-lg shadow-sm shadow-gray-200 overflow-hidden mt-3 mr-2 mb-2">
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