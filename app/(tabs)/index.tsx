import { formatPropertyType, isHouseAndLotType, normalizePropertyTypeKey } from "@/app/lib/property-type";
import { formatPrice } from "@/app/lib/format-price";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  useWindowDimensions,
  Modal,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getCityPropertyCounts, getFeaturedWithFallback } from "../service/property-service";
import { API_USER_MESSAGES } from "../lib/api-result";
import { DataFetchState } from "../modules/generics/components/DataFetchState";
import type { Property } from "../constants/mock/mock-properties";

// Hero banner images – provincial Ilocos Sur scenery
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80", // mountain landscape
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80", // golden farm fields
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80", // coastal beach
];

const HERO_LABELS = [
  { title: "Mountain Highlands", sub: "Discover serene properties in the Ilocos highlands." },
  { title: "Fertile Farmlands", sub: "Invest in lush agricultural land across Ilocos Sur." },
  { title: "Coastal Paradise", sub: "Find your dream beachfront villa by the sea." },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [searchText, setSearchText] = useState("");
  const [contactModalVisible, setContactModalVisible] = useState(false);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        scrollViewRef.current?.scrollTo({ x: next * (width - 32), animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [width]);

  const onScroll = (event: any) => {
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeSlide && slide >= 0 && slide < HERO_IMAGES.length) {
      setActiveSlide(slide);
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      router.push({ pathname: "/(tabs)/properties", params: { search: searchText.trim() } });
    } else {
      router.push("/(tabs)/properties");
    }
  };

  const navigateToCategory = (type: string) => {
    router.push({ pathname: "/(tabs)/properties", params: { type } });
  };

  // Contact agent helpers (same as in details)
  const openMobile = () => {
    const separator = Platform.OS === "ios" ? "&" : "?";
    Linking.openURL(`sms:09261849580${separator}body=${encodeURIComponent("Hi, I have a property I'd like to list. Please get in touch with me.")}`)
  };
  const openGmail = () => {
    if (Platform.OS === "web") {
      Linking.openURL(`https://mail.google.com/mail/?view=cm&fs=1&to=ilocossurproperty@gmail.com&su=${encodeURIComponent("Property Listing Inquiry")}&body=${encodeURIComponent("Hi, I have a property I'd like to list with Ilocos Sur Property. Please get in touch with me.")}`);
    } else {
      Linking.openURL(`mailto:ilocossurproperty@gmail.com?subject=${encodeURIComponent("Property Listing Inquiry")}&body=${encodeURIComponent("Hi, I have a property I'd like to list with Ilocos Sur Property. Please get in touch with me.")}`);
    }
  };
  const openFB = () => Linking.openURL("https://www.facebook.com/people/Ilocos-Sur-Property/61589026535906/");
  const openInstagram = () => Linking.openURL("https://www.instagram.com/ilocossurproperty/");

  const quickActions = [
    { label: "House & Lot", icon: "home-outline", type: "HOUSE_AND_LOT", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Lot Only", icon: "map-outline", type: "LOT", color: "#10b981", bg: "#ecfdf5" },
    { label: "Condo", icon: "domain", type: "CONDO", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Commercial", icon: "storefront-outline", type: "COMMERCIAL", color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  // Fetch city counts → derive totalListings & totalTowns
  const [totalListings, setTotalListings] = useState<number | null>(null);
  const [totalTowns, setTotalTowns] = useState<number | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const countsResult = await getCityPropertyCounts();
      if (cancelled) return;
      if (!countsResult.ok) {
        setStatsError(countsResult.error.message);
        setTotalListings(null);
        setTotalTowns(null);
        return;
      }
      setStatsError(null);
      const counts = countsResult.data;
      const listings = Object.values(counts).reduce((sum, n) => sum + n, 0);
      const towns = Object.keys(counts).length;
      setTotalListings(listings);
      setTotalTowns(towns);
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch admin-selected featured properties (with newest-fill fallback).
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [featuredShow, setFeaturedShow] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [featuredRetryKey, setFeaturedRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFeaturedLoading(true);
      setFeaturedError(null);
      const result = await getFeaturedWithFallback(5, 5);
      if (cancelled) return;
      if (!result.ok) {
        setFeaturedError(result.error.message);
        setFeaturedProperties([]);
        setFeaturedShow(true);
      } else {
        setFeaturedProperties(result.data.list);
        setFeaturedShow(result.data.show);
      }
      setFeaturedLoading(false);
    })();
    return () => { cancelled = true; };
  }, [featuredRetryKey]);

  const hideFeaturedSection = !featuredLoading && !featuredError && !featuredShow;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Top Section: Greeting & Search */}
        <View className="px-4 pt-6 pb-4 bg-white rounded-b-3xl shadow-sm shadow-gray-200 mb-4">
          <View className="flex-row items-center mb-6">
            <Image
              source={require("../../assets/images/ilocos-sur-icon.png")}
              style={{ width: 48, height: 48, borderRadius: 12, marginRight: 12 }}
              resizeMode="contain"
            />
            <View>
              <Text className="text-gray-500 text-sm font-medium">Welcome to Ilocos Sur</Text>
              <Text className="text-2xl font-bold text-gray-800">Find your next home 🏡</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 border border-gray-200">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="ml-2 text-gray-700 flex-1"
              placeholder="Search by city, barangay, or title..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              className="bg-blue-600 p-2 rounded-full"
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats Strip */}
          <View style={{
            flexDirection: "row",
            marginTop: 16,
            backgroundColor: "#eff6ff",
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 8,
          }}>
            {[
              {
                icon: "home-city-outline" as const,
                color: "#1d4ed8",
                value: totalListings !== null ? String(totalListings) : "—",
                label: "Total Listings",
              },
              {
                icon: "map-marker-multiple-outline" as const,
                color: "#059669",
                value: totalTowns !== null ? String(totalTowns) : "—",
                label: "Cities Covered",
              },
              {
                icon: "check-decagram-outline" as const,
                color: "#7c3aed",
                value: "100%",
                label: "Verified",
              },
            ].map((stat, i, arr) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRightWidth: i < arr.length - 1 ? 1 : 0,
                  borderRightColor: "#bfdbfe",
                }}
              >
                <MaterialCommunityIcons name={stat.icon} size={20} color={stat.color} />
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#0f172a", marginTop: 4 }}>
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: "500", color: "#64748b", marginTop: 1 }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
          {statsError ? (
            <View style={{ marginTop: 10, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 12, color: "#b91c1c", textAlign: "center" }}>{statsError}</Text>
              <TouchableOpacity
                onPress={() => {
                  setStatsError(null);
                  void (async () => {
                    const r = await getCityPropertyCounts();
                    if (!r.ok) {
                      setStatsError(r.error.message);
                      return;
                    }
                    const c = r.data;
                    setTotalListings(Object.values(c).reduce((s, n) => s + n, 0));
                    setTotalTowns(Object.keys(c).length);
                  })();
                }}
                style={{ alignSelf: "center", marginTop: 6, paddingVertical: 6, paddingHorizontal: 12 }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#2563eb" }}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Hero Section: Automatic Slide Show */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Explore Ilocos Sur</Text>
          <View className="rounded-2xl overflow-hidden shadow-sm shadow-gray-300 bg-white">
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            >
              {HERO_IMAGES.map((img, index) => (
                <View key={index} style={{ width: width - 32 }} className="h-48 relative">
                  <Image source={{ uri: img }} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute inset-0 bg-black/30" />
                  <View className="absolute bottom-4 left-4 right-4">
                    <Text className="text-white text-xl font-bold mb-1 shadow-sm">
                      {HERO_LABELS[index].title}
                    </Text>
                    <Text className="text-gray-200 text-sm">
                      {HERO_LABELS[index].sub}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            {/* Pagination Dots */}
            <View className="absolute bottom-3 right-4 flex-row space-x-1">
              {HERO_IMAGES.map((_, i) => (
                <View
                  key={i}
                  className={`h-2 rounded-full transition-all ${i === activeSlide ? "w-4 bg-blue-600" : "w-2 bg-white/70"}`}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">Categories</Text>
          <View className="flex-row justify-between">
            {quickActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => navigateToCategory(action.type)}
                className="items-center"
              >
                <View
                  style={{ backgroundColor: action.bg }}
                  className="w-14 h-14 rounded-full justify-center items-center mb-2 shadow-sm shadow-gray-200"
                >
                  <MaterialCommunityIcons name={action.icon as any} size={26} color={action.color} />
                </View>
                <Text className="text-xs font-medium text-gray-700">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Properties */}
        {!hideFeaturedSection && (
        <View className="mb-6">
          <View className="px-4 flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Featured Properties</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/properties")}>
              <Text className="text-blue-600 text-sm font-semibold">See All</Text>
            </TouchableOpacity>
          </View>
          
          {featuredLoading ? (
            <View style={{ height: 200, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#1d4ed8" />
            </View>
          ) : featuredError ? (
            <DataFetchState
              variant="error"
              title="Couldn’t load featured listings"
              message={featuredError}
              onRetry={() => setFeaturedRetryKey((k) => k + 1)}
              retryLabel="Try again"
              compact
            />
          ) : featuredProperties.length === 0 ? (
            <View style={{ paddingVertical: 24, paddingHorizontal: 16 }}>
              <Text style={{ textAlign: "center", color: "#64748b", fontSize: 15 }}>
                {API_USER_MESSAGES.noListings}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
            >
              {featuredProperties.map((property) => {
                const firstImage = property.media?.[0]?.url ?? null;
                const typeColor =
                  isHouseAndLotType(property.type) ? "#1d4ed8"
                  : normalizePropertyTypeKey(property.type) === "LOT" ? "#059669"
                  : normalizePropertyTypeKey(property.type) === "CONDO" ? "#7c3aed"
                  : "#d97706";
                const isSold = property.status?.toUpperCase() === "SOLD";
                return (
                  <TouchableOpacity
                    key={property.id}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/details/${property.id}`)}
                    style={{
                      width: 200,
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      overflow: "hidden",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    {/* Image */}
                    <View style={{ height: 120, backgroundColor: "#e2e8f0", position: "relative" }}>
                      {firstImage ? (
                        <Image
                          source={{ uri: firstImage }}
                          style={{ width: "100%", height: "100%", opacity: isSold ? 0.5 : 1 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ fontSize: 32 }}>🏠</Text>
                        </View>
                      )}
                      <View style={{
                        position: "absolute", top: 8, left: 8,
                        backgroundColor: typeColor,
                        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                      }}>
                        <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
                          {formatPropertyType(property.type)}
                        </Text>
                      </View>
                      <View style={{
                        position: "absolute", top: 8, right: 8,
                        width: 8, height: 8, borderRadius: 4,
                        backgroundColor: isSold ? "#ef4444" : property.status === "reserved" ? "#f59e0b" : "#22c55e",
                        borderWidth: 1.5, borderColor: "#fff",
                      }} />
                    </View>
                    {/* Info */}
                    <View style={{ padding: 12 }}>
                      <Text style={{ fontSize: 15, fontWeight: "800", color: "#1d4ed8", marginBottom: 2 }}>
                        {formatPrice(property.price, { compact: true })}
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: "#1e293b", marginBottom: 4 }} numberOfLines={1}>
                        {property.title}
                      </Text>
                      <Text style={{ fontSize: 11, color: "#64748b" }} numberOfLines={1}>
                        📍 {property.location?.barangay}, {property.location?.city}
                      </Text>
                      {property.lotArea ? (
                        <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          📐 {property.lotArea} sqm
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
        )}

        {/* CTA Section */}
        <View className="px-4 mb-8">
          <View className="bg-blue-600 rounded-2xl p-6 relative overflow-hidden shadow-md shadow-blue-300">
            {/* Decorative background circles */}
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full" />
            
            <Text className="text-white text-xl font-bold mb-2">Have a property to sell?</Text>
            <Text className="text-blue-100 text-sm mb-4">
              List your property with us and reach thousands of potential buyers in Ilocos Sur.
            </Text>
            <TouchableOpacity
              className="bg-white py-3 px-6 rounded-full self-start flex-row items-center"
              onPress={() => setContactModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text className="text-blue-600 font-bold mr-2">Contact Agent</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* ── Contact Agent Modal ─────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contactModalVisible}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#1f2937" }}>Contact Agent</Text>
              <TouchableOpacity
                onPress={() => setContactModalVisible(false)}
                style={{ backgroundColor: "#f3f4f6", padding: 8, borderRadius: 100 }}
              >
                <MaterialCommunityIcons name="close" size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: "#eff6ff", padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#bfdbfe" }}>
              {/* <Text style={{ fontSize: 14, fontWeight: "700", color: "#1e40af", marginBottom: 4 }}>Clark Adam Arconado</Text> */}
              <Text style={{ fontSize: 12, color: "#2563eb", marginBottom: 2 }}>Email: ilocossurproperty@gmail.com</Text>
              {/* <Text style={{ fontSize: 12, color: "#2563eb" }}>Mobile: 09261849580</Text> */}
            </View>

            <Text style={{ fontSize: 12, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Send a message via
            </Text>

            <View style={{ gap: 10, marginBottom: 24 }}>
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  onPress={openMobile}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}
                  activeOpacity={0.7}
                >
                  <View style={{ backgroundColor: "#dcfce7", padding: 10, borderRadius: 100, marginRight: 16 }}>
                    <MaterialCommunityIcons name="message-text" size={22} color="#16a34a" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>SMS / Messaging App</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={openGmail}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: "#fee2e2", padding: 10, borderRadius: 100, marginRight: 16 }}>
                  <MaterialCommunityIcons name="gmail" size={22} color="#ea4335" />
                </View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>Gmail</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openFB}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: "#dbeafe", padding: 10, borderRadius: 100, marginRight: 16 }}>
                  <MaterialCommunityIcons name="facebook" size={22} color="#1877f2" />
                </View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openInstagram}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: "#fce7f3", padding: 10, borderRadius: 100, marginRight: 16 }}>
                  <MaterialCommunityIcons name="instagram" size={22} color="#e1306c" />
                </View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>Instagram</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
