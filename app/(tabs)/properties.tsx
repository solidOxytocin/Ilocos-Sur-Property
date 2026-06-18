import GridViewCardProperty from "@/app/modules/property-list/components/gridViewCardProperty";
import { propertyTypeMatches } from "@/app/lib/property-type";
import ListViewCardProperty from "@/app/modules/property-list/components/listViewCardProperty";
import SearchAndFilters from "@/app/modules/property-list/components/searchAndFilters";
import { PropertyCardSkeleton } from "../modules/property-list/components/PropertyCardSkeleton";
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { getPropertiesPaginated, propertyListFromPaginatedOk, getPropertyBounds, type ApiFailure } from "../service/property-service";
import { API_USER_MESSAGES } from "../lib/api-result";
import { DataFetchState } from "../modules/generics/components/DataFetchState";
import PropertyDetailsContent from "../modules/details-view/components/propertyDetailsContent";
import { FilterModal, FilterState } from "../modules/property-list/components/filterModal";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

const PAGE_SIZE = 12;
const GRID_GAP = 16;

type SortField = "createdAt" | "price" | "lotArea" | "city";
type SortOrder = "asc" | "desc";

const SORT_FIELDS: { label: string; field: SortField }[] = [
  { label: "Newest",  field: "createdAt" },
  { label: "Price", field: "price" },
  { label: "Area",  field: "lotArea" },
  { label: "City",  field: "city" },
];

// Client-side sort for mock mode — sold properties always last
function isSoldProperty(p: Property): boolean {
  return p.status?.toUpperCase() === "SOLD";
}

function compareByField(a: Property, b: Property, field: SortField, order: SortOrder): number {
  let av: any = field === "city" ? (a.location?.city ?? "") : (a[field as keyof Property] ?? "");
  let bv: any = field === "city" ? (b.location?.city ?? "") : (b[field as keyof Property] ?? "");
  if (field === "createdAt") {
    av = new Date(av).getTime();
    bv = new Date(bv).getTime();
  }
  if (typeof av === "string") return order === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  return order === "asc" ? av - bv : bv - av;
}

/** Price/Area chip ↑ = highest first (desc in query), ↓ = lowest first (asc in query). */
function effectiveSortOrder(field: SortField, order: SortOrder): SortOrder {
  if (field === "price" || field === "lotArea") return order === "asc" ? "desc" : "asc";
  return order;
}

function sortMockProperties(list: Property[], field: SortField | null, order: SortOrder): Property[] {
  return [...list].sort((a, b) => {
    const aSold = isSoldProperty(a);
    const bSold = isSoldProperty(b);
    if (aSold !== bSold) return aSold ? 1 : -1;
    if (!field) return 0;
    return compareByField(a, b, field, effectiveSortOrder(field, order));
  });
}

export default function PropertyList() {
  const { id: preselectedId, city: preselectedCity, type: preselectedType, status: preselectedStatus, search: preselectedSearch } =
    useLocalSearchParams<{ id?: string; city?: string; type?: string; status?: string; search?: string }>();

  const [isListView, setIsListView]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [fetchError, setFetchError]   = useState<ApiFailure | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<ApiFailure | null>(null);
  const [listRetryKey, setListRetryKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    type: [], status: [], features: [], amenities: [], minPrice: 0, maxPrice: 0, province: "", city: "", barangay: "", minArea: 0, maxArea: 0,
  });
  // Track the absolute bounds so we can skip sending max values that equal the ceiling
  const [filterBounds, setFilterBounds] = useState({ maxPrice: 0, maxLotArea: 0 });

  useEffect(() => {
    getPropertyBounds().then((res) => {
      if (res.ok) setFilterBounds(res.data);
    });
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      filters.type.length > 0 || filters.status.length > 0 || filters.province !== "" || filters.city !== "" || filters.barangay !== "" ||
      filters.features.length > 0 || filters.amenities.length > 0 ||
      filters.minPrice > 0 ||
      (filters.maxPrice > 0 && (filterBounds.maxPrice === 0 || filters.maxPrice < filterBounds.maxPrice)) ||
      filters.minArea > 0 ||
      (filters.maxArea > 0 && (filterBounds.maxLotArea === 0 || filters.maxArea < filterBounds.maxLotArea)),
    [filters, filterBounds]
  );

  const quickFilters = [
    { label: "Available", key: "status", value: "AVAILABLE" },
    { label: "House & Lot", key: "type",   value: "HOUSE_AND_LOT" },
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
    if (filters.type.length > 0)     f.type     = filters.type;
    if (filters.status.length > 0)   f.status   = filters.status;
    if (filters.features.length > 0) f.features = filters.features;
    if (filters.amenities.length > 0) f.amenities = filters.amenities;
    if (filters.province)           f.province = filters.province;
    if (filters.city)                f.city     = filters.city;
    if (filters.barangay)            f.barangay = filters.barangay;
    if (filters.minPrice > 0)        f.minPrice = filters.minPrice;
    // Only send maxPrice when user has actually restricted it below the absolute ceiling
    if (filters.maxPrice > 0 && (filterBounds.maxPrice === 0 || filters.maxPrice < filterBounds.maxPrice)) {
      f.maxPrice = filters.maxPrice;
    }
    if (filters.minArea > 0)         f.minArea  = filters.minArea;
    // Only send maxArea when user has actually restricted it below the absolute ceiling
    if (filters.maxArea > 0 && (filterBounds.maxLotArea === 0 || filters.maxArea < filterBounds.maxLotArea)) {
      f.maxArea = filters.maxArea;
    }
    if (sortField) {
      f.sortBy = sortField;
      f.sortOrder = effectiveSortOrder(sortField, sortOrder);
    }
    return f;
  }, [debouncedSearchQuery, filters, filterBounds, sortField, sortOrder]);

  // ── Load page 1 whenever filters / sort change ─────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchFirstPage() {
      setLoading(true);
      setFetchError(null);
      setLoadMoreError(null);
      setProperties([]);
      setCurrentPage(1);
     
      if (process.env.EXPO_PUBLIC_IS_MOCK === "true") {
        // Apply client-side filter + sort on mock data
        let filtered = mockProperties.filter((p) => {
          if (filters.type.length > 0 && !filters.type.some((t) => propertyTypeMatches(p.type, t))) return false;
          if (filters.status.length > 0 && !filters.status.map(s => s.toLowerCase()).includes(p.status)) return false;
          if (filters.province && p.location?.province?.toLowerCase() !== filters.province.toLowerCase()) return false;
          if (filters.city && p.location?.city?.toLowerCase() !== filters.city.toLowerCase()) return false;
          if (filters.barangay && p.location?.barangay?.toLowerCase() !== filters.barangay.toLowerCase()) return false;
          if (filters.minPrice > 0 && (p.price ?? 0) < filters.minPrice) return false;
          if (filters.maxPrice > 0 && (p.price ?? 0) > filters.maxPrice) return false;
          if (filters.minArea > 0 && (p.lotArea ?? 0) < filters.minArea) return false;
          if (filters.maxArea > 0 && (p.lotArea ?? 0) > filters.maxArea) return false;
          if (filters.features.length > 0) {
            const propFeatureKeys = (p.features ?? []).map((f) => f.key);
            if (!filters.features.every((fk) => propFeatureKeys.includes(fk))) return false;
          }
          if (filters.amenities.length > 0) {
            const propAmenityKeys = (p.amenities ?? []).map((a) => a.key);
            if (!filters.amenities.every((ak) => propAmenityKeys.includes(ak))) return false;
          }
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
        filtered = sortMockProperties(filtered, sortField, sortOrder);
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
        if (!result.ok) {
          setFetchError(result.error);
          setProperties([]);
          setTotal(0);
          setTotalPages(0);
        } else {
          setProperties(propertyListFromPaginatedOk(result.data));
          setTotal(result.data.total);
          setTotalPages(result.data.totalPages);
          setCurrentPage(1);
        }
        setLoading(false);
      }
    }

    fetchFirstPage();
    return () => { cancelled = true; };
  }, [debouncedSearchQuery, filters, sortField, sortOrder, listRetryKey]);

  // ── Append next page on scroll-to-end ─────────────────────────────────────
  const loadNextPage = useCallback(async () => {
    if (loadingMore || loading || currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);

    if (process.env.EXPO_PUBLIC_IS_MOCK === "true") {
      // slice next page from already-sorted mock
      let filtered = mockProperties.filter((p) => {
        if (filters.type.length > 0 && !filters.type.some((t) => propertyTypeMatches(p.type, t))) return false;
        if (filters.status.length > 0 && !filters.status.map(s => s.toLowerCase()).includes(p.status)) return false;
        if (filters.city && p.location?.city?.toLowerCase() !== filters.city.toLowerCase()) return false;
        if (filters.barangay && p.location?.barangay?.toLowerCase() !== filters.barangay.toLowerCase()) return false;
        if (filters.minPrice > 0 && (p.price ?? 0) < filters.minPrice) return false;
        if (filters.maxPrice > 0 && (p.price ?? 0) > filters.maxPrice) return false;
        if (filters.minArea > 0 && (p.lotArea ?? 0) < filters.minArea) return false;
        if (filters.maxArea > 0 && (p.lotArea ?? 0) > filters.maxArea) return false;
        if (filters.features.length > 0) {
          const propFeatureKeys = (p.features ?? []).map((f) => f.key);
          if (!filters.features.every((fk) => propFeatureKeys.includes(fk))) return false;
        }
        if (filters.amenities.length > 0) {
          const propAmenityKeys = (p.amenities ?? []).map((a) => a.key);
          if (!filters.amenities.every((ak) => propAmenityKeys.includes(ak))) return false;
        }
        if (debouncedSearchQuery) {
          const q = debouncedSearchQuery.toLowerCase();
          return p.title?.toLowerCase().includes(q) || p.location?.city?.toLowerCase().includes(q) || p.location?.barangay?.toLowerCase().includes(q);
        }
        return true;
      });
      filtered = sortMockProperties(filtered, sortField, sortOrder);
      const slice = filtered.slice((nextPage - 1) * PAGE_SIZE, nextPage * PAGE_SIZE);
      setProperties(prev => [...prev, ...slice]);
      setCurrentPage(nextPage);
      setLoadingMore(false);
      return;
    }

    const result = await getPropertiesPaginated(buildFetchFilters(), nextPage, PAGE_SIZE);
    if (!result.ok) {
      setLoadMoreError(result.error);
      setLoadingMore(false);
      return;
    }
    setLoadMoreError(null);
    setProperties((prev) => [...prev, ...propertyListFromPaginatedOk(result.data)]);
    setCurrentPage(nextPage);
    setTotalPages(result.data.totalPages);
    setLoadingMore(false);
  }, [loadingMore, loading, currentPage, totalPages, buildFetchFilters, filters, debouncedSearchQuery, sortField, sortOrder]);

  const retryFirstPage = useCallback(() => {
    setListRetryKey((k) => k + 1);
  }, []);

  const retryLoadMore = useCallback(() => {
    setLoadMoreError(null);
    loadNextPage();
  }, [loadNextPage]);

  // ── Layout ─────────────────────────────────────────────────────────────────
  const { width } = useWindowDimensions();
  const isWebDesktop = width >= 1024;
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  // ── Auto-select property from URL param (e.g. /properties?id=3) ────────────
  useEffect(() => {
    if (Platform.OS !== "web" || !preselectedId) return;
    const numId = Number(preselectedId);
    if (!numId) return;
    if (width < 1024) return;
    // Split-panel list view is desktop-only
    setIsListView(true);
    setSelectedPropertyId(numId);
  }, [preselectedId, width]);

  // Grid-only on narrow viewports (list toggle is hidden)
  useEffect(() => {
    if (width < 768 && isListView) {
      setIsListView(false);
      setSelectedPropertyId(null);
    }
  }, [width, isListView]);

  // ── Pre-apply search query from URL param ────────────────────────────────────
  useEffect(() => {
    if (!preselectedSearch) return;
    setSearchQuery(preselectedSearch);
  }, [preselectedSearch]);

  // ── Pre-apply city filter from URL param (e.g. /properties?city=Vigan+City) ──
  useEffect(() => {
    if (!preselectedCity) return;
    setFilters((prev) => ({ ...prev, city: preselectedCity }));
  }, [preselectedCity]);

  // ── Pre-apply type / status filters from URL params ──────────────────────────
  useEffect(() => {
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

  const isWeb = Platform.OS === "web";
  const isWebMobile = isWeb && width < 768;
  const isWebSplitList = isWebDesktop && isListView;

  const numColumns = isListView
    ? 1
    : width > 1200
      ? 5
      : width > 1000
        ? 4
        : width > 800
          ? 3
          : 2;

  const gridHorizontalPadding = isWebSplitList ? 4 : isWebMobile ? 12 : 8;
  const gridColumnWidth = useMemo(() => {
    if (isListView) return 0;
    const available = width - gridHorizontalPadding * 2 - GRID_GAP * (numColumns - 1);
    return Math.floor(available / numColumns);
  }, [width, numColumns, isListView, gridHorizontalPadding]);

  const gridColumnWrapperStyle = useMemo(
    () =>
      !isListView && numColumns > 1
        ? { gap: GRID_GAP, justifyContent: "flex-start" as const, alignItems: "flex-start" as const }
        : undefined,
    [isListView, numColumns]
  );

  const skeletonCount = isListView ? 6 : Math.ceil(PAGE_SIZE / numColumns) * numColumns;
  const skeletonData = Array.from({ length: skeletonCount }, (_, i) => i);

  const renderGridCell = (child: React.ReactNode) => (
    <View style={{ width: gridColumnWidth, alignSelf: "flex-start", marginBottom: GRID_GAP }}>{child}</View>
  );

  const renderItem = ({ item }: { item: Property }) =>
    isListView ? (
      <ListViewCardProperty
        property={item}
        onPress={isWebDesktop ? () => setSelectedPropertyId(item.id) : undefined}
        compact={isWebSplitList}
        isSelected={isWebSplitList && selectedPropertyId === item.id}
      />
    ) : (
      renderGridCell(<GridViewCardProperty property={item} />)
    );

  const renderFooter = () => {
    if (loadMoreError) {
      return (
        <View className="py-6 px-4 items-center">
          <Text className="text-sm text-red-600 text-center mb-2">{loadMoreError.message}</Text>
          <Pressable
            onPress={retryLoadMore}
            className="px-4 py-2 rounded-lg bg-blue-600"
            disabled={loadingMore}
          >
            <Text className="text-white font-semibold text-sm">Try again</Text>
          </Pressable>
        </View>
      );
    }
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
    <SafeAreaView className="flex-1 bg-gray-100 overflow-hidden">
      <View className="flex-1 flex-row min-h-0">
        {/* ── LEFT COLUMN (Header + List) ────────────────────────── */}
        <View className={isWebSplitList ? "w-[35%] min-w-0 shrink-0" : "flex-1 min-w-0"}>
          {/* Header spanning full width of left column */}
          <View className="bg-white z-10">
            <SearchAndFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isListView={isListView}
              setListView={setIsListView}
              onOpenFilters={() => setIsFilterModalVisible(true)}
              hasActiveFilters={hasActiveFilters}
              compact={isWebSplitList}
            />

            {/* Sort chips — one chip per field, arrow appears only when active */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingHorizontal: isWebSplitList ? 8 : isWebMobile ? 12 : 16, paddingVertical: 8, minWidth: 0 }}>
              <MaterialIcons name="sort" size={16} color="#6b7280" />
              <Text style={{ fontSize: 11, fontWeight: '500', color: '#6b7280', marginLeft: 4, marginRight: 8, flexShrink: 0 }}>Sort:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 2, paddingRight: 4 }}
                style={{ flex: 1, minWidth: 0 }}
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
                      {isActive && field === 'city' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}>
                          <MaterialIcons
                            name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
                            size={14}
                            color="#fff"
                          />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff', marginLeft: 2 }}>
                            {sortOrder === 'asc' ? 'A' : 'Z'}
                          </Text>
                        </View>
                      )}
                      {isActive && field !== 'createdAt' && field !== 'city' && (
                        <MaterialIcons
                          name={sortOrder === 'asc' ? 'arrow-upward' : 'arrow-downward'}
                          size={14}
                          color="#fff"
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Quick filter chips */}
            <View style={{ backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingVertical: 10, paddingBottom: 16, minWidth: 0 }}>
              <FlatList
                horizontal
                data={quickFilters}
                keyExtractor={(qf) => qf.value}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 2,
                  paddingLeft: isWebSplitList ? 8 : isWebMobile ? 12 : 16,
                  paddingRight: isWebSplitList ? 8 : isWebMobile ? 12 : 16,
                }}
                renderItem={({ item: qf }) => {
                  const isActive = filters[qf.key as "type" | "status"].includes(qf.value);
                  return (
                    <Pressable
                      onPress={() => handleQuickFilterToggle(qf.key as "type" | "status", qf.value)}
                      style={[
                        {
                          paddingHorizontal: isWebMobile ? 12 : 16,
                          paddingVertical: 8,
                          marginRight: 8,
                          borderRadius: 999,
                          borderWidth: 1,
                        },
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
          <View className={`flex-1 pt-5 min-w-0 ${isWebSplitList ? "px-1" : isWebMobile ? "px-3" : "px-2"}`}>
            {!isMounted ? null : loading ? (
              <View className={isListView ? "flex-1 min-w-0" : "flex-1 w-full min-w-0"}>
                <FlatList
                  key={numColumns + (isListView ? "-list-skel" : "-grid-skel")}
                  data={skeletonData}
                  renderItem={() =>
                    isListView ? (
                      <PropertyCardSkeleton viewMode="list" />
                    ) : (
                      renderGridCell(<PropertyCardSkeleton viewMode="grid" />)
                    )
                  }
                  keyExtractor={(item) => `skel-${item}`}
                  numColumns={numColumns}
                  showsVerticalScrollIndicator={false}
                  className="w-full"
                  columnWrapperStyle={gridColumnWrapperStyle}
                  contentContainerStyle={{ paddingBottom: GRID_GAP }}
                />
              </View>
            ) : fetchError ? (
              <DataFetchState
                variant={fetchError.code === "offline" ? "offline" : "error"}
                title={fetchError.code === "offline" ? "You’re offline" : "Couldn’t load listings"}
                message={fetchError.message}
                onRetry={retryFirstPage}
                retryLabel="Try again"
              />
            ) : properties.length === 0 ? (
              <DataFetchState
                variant="empty"
                title="No properties found"
                message={API_USER_MESSAGES.emptyList}
              />
            ) : (
              <View className={isListView ? "flex-1 min-w-0" : "flex-1 w-full min-w-0"}>
                <FlatList
                  key={numColumns + (isListView ? "-list" : "-grid")}
                  data={properties}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  numColumns={numColumns}
                  showsVerticalScrollIndicator={false}
                  className="w-full"
                  columnWrapperStyle={gridColumnWrapperStyle}
                  contentContainerStyle={{ paddingBottom: GRID_GAP }}
                  onEndReached={loadNextPage}
                  onEndReachedThreshold={0.4}
                  ListFooterComponent={renderFooter}
                />
              </View>
            )}
          </View>
        </View>

        {/* ── Web split-view details panel ────────────────────────── */}
        {isWebSplitList && (
          <View className="w-[65%] min-w-0 shrink-0 bg-white border-l border-gray-200 overflow-hidden">
            {selectedProperty ? (
              <PropertyDetailsContent
                property={selectedProperty}
                onClose={() => setSelectedPropertyId(null)}
              />
            ) : (
              <View className="flex-1 justify-center items-center h-full bg-slate-50/50 px-8">
                <View className="bg-white p-6 rounded-full shadow-md shadow-slate-200/50 mb-6">
                  <MaterialCommunityIcons name="home-search-outline" size={64} color="#94a3b8" />
                </View>
                <Text className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2 text-center">
                  Explore Properties
                </Text>
                <Text className="text-base font-medium text-slate-500 text-center max-w-lg leading-relaxed">
                  Select a property from the list to view its full details, high-quality images, and location map.
                </Text>
              </View>
            )}
          </View>
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