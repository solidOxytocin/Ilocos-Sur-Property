import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { mockProperties } from "../constants/mock/mock-properties";
import GridViewCardProperty from "../modules/property-list/components/gridViewCardProperty";

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
      Linking.openURL(`https://mail.google.com/mail/?view=cm&fs=1&to=clarkadamarconado@gmail.com&su=${encodeURIComponent("Property Listing Inquiry")}&body=${encodeURIComponent("Hi, I have a property I'd like to list with Ilocos Sur Property. Please get in touch with me.")}`);
    } else {
      Linking.openURL(`mailto:clarkadamarconado@gmail.com?subject=${encodeURIComponent("Property Listing Inquiry")}&body=${encodeURIComponent("Hi, I have a property I'd like to list with Ilocos Sur Property. Please get in touch with me.")}`);
    }
  };
  const openFB = () => Linking.openURL("https://www.facebook.com/clark.arconado.1/");
  const openInstagram = () => Linking.openURL("https://www.instagram.com/clarkadam69/");

  const quickActions = [
    { label: "House", icon: "home-outline", type: "HOUSE", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Lot Only", icon: "map-outline", type: "LOT", color: "#10b981", bg: "#ecfdf5" },
    { label: "Condo", icon: "domain", type: "CONDO", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Commercial", icon: "storefront-outline", type: "COMMERCIAL", color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  // Get 5 featured properties
  const featuredProperties = mockProperties.slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Top Section: Greeting & Search */}
        <View className="px-4 pt-6 pb-4 bg-white rounded-b-3xl shadow-sm shadow-gray-200 mb-4">
          <View className="flex-row items-center mb-6">
            <Image
              source={require("../../assets/images/ilocos-sur-48x.jpg")}
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
        <View className="mb-6">
          <View className="px-4 flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Featured Properties</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/properties")}>
              <Text className="text-blue-600 text-sm font-semibold">See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
          >
            {featuredProperties.map((property, idx) => (
              <View key={idx} className="mr-1">
                <GridViewCardProperty property={property} />
              </View>
            ))}
          </ScrollView>
        </View>

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
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1e40af", marginBottom: 4 }}>Clark Adam Arconado</Text>
              <Text style={{ fontSize: 12, color: "#2563eb", marginBottom: 2 }}>Email: clarkadamarconado@gmail.com</Text>
              <Text style={{ fontSize: 12, color: "#2563eb" }}>Mobile: 09261849580</Text>
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
