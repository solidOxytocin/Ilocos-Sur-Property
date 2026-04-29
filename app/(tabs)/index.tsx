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
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { mockProperties } from "../constants/mock/mock-properties";
import GridViewCardProperty from "../modules/property-list/components/gridViewCardProperty";

import Hero1 from "../../assets/images/hero_1.png";
import Hero2 from "../../assets/images/hero_2.png";
import Hero3 from "../../assets/images/hero_3.png";

const HERO_IMAGES = [Hero1, Hero2, Hero3];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % HERO_IMAGES.length;
        scrollViewRef.current?.scrollTo({ x: next * (width - 32), animated: true });
        return next;
      });
    }, 4000); // 4 seconds
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

  const handleSearch = (text: string) => {
    // We can pass search text as params, or just navigate to browse
    router.push("/(tabs)/properties");
  };

  const navigateToCategory = (type: string) => {
    router.push({ pathname: "/(tabs)/properties", params: { type } });
  };

  const quickActions = [
    { label: "House", icon: "home-outline", type: "HOUSE", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Lot Only", icon: "map-outline", type: "LOT", color: "#10b981", bg: "#ecfdf5" },
    { label: "Condo", icon: "domain", type: "CONDO", color: "#f59e0b", bg: "#fffbeb" },
    { label: "Commercial", icon: "storefront-outline", type: "COMMERCIAL", color: "#8b5cf6", bg: "#f5f3ff" },
  ];

  // Get 5 featured properties (for example, newest or randomly picked from mock)
  const featuredProperties = mockProperties.slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Top Section: Greeting & Search */}
        <View className="px-4 pt-6 pb-4 bg-white rounded-b-3xl shadow-sm shadow-gray-200 mb-4">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-gray-500 text-sm font-medium">Welcome to Ilocos Sur</Text>
              <Text className="text-2xl font-bold text-gray-800">Find your next home 🏡</Text>
            </View>
            <View className="bg-blue-100 p-2 rounded-full">
              <MaterialCommunityIcons name="bell-outline" size={24} color="#2563eb" />
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(tabs)/properties")}
            className="flex-row items-center bg-gray-100 rounded-full px-4 py-3 border border-gray-200"
          >
            <Ionicons name="search" size={20} color="#6b7280" />
            <Text className="ml-2 text-gray-500 flex-1">Search by city, barangay, or title...</Text>
            <View className="bg-blue-600 p-2 rounded-full">
              <Ionicons name="options-outline" size={16} color="white" />
            </View>
          </TouchableOpacity>
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
                  <Image source={img} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute inset-0 bg-black/30" />
                  <View className="absolute bottom-4 left-4 right-4">
                    <Text className="text-white text-xl font-bold mb-1 shadow-sm">
                      {index === 0 ? "Heritage & Modernity" : index === 1 ? "Vibrant Sunsets" : "Coastal Luxury"}
                    </Text>
                    <Text className="text-gray-200 text-sm">
                      {index === 0 ? "Discover unique homes in Vigan." : index === 1 ? "Experience the charm of Calle Crisologo." : "Find your dream beachfront villa."}
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
            {/* Decorative background circle */}
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full" />
            
            <Text className="text-white text-xl font-bold mb-2">Have a property to sell?</Text>
            <Text className="text-blue-100 text-sm mb-4">
              List your property with us and reach thousands of potential buyers in Ilocos Sur.
            </Text>
            <TouchableOpacity className="bg-white py-3 px-6 rounded-full self-start flex-row items-center">
              <Text className="text-blue-600 font-bold mr-2">Post your property</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
