import React from "react";
import { View, ScrollView, Platform, useWindowDimensions } from "react-native";
import { Skeleton } from "../../generics/components/Skeleton";

export function PropertyDetailsSkeleton() {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktopLayout = Platform.OS === "web" && screenWidth >= 1024;
  const heroImageHeight = isDesktopLayout ? 400 : 288;

  return (
    <View className="flex-1 relative bg-white w-full h-full">
      <ScrollView
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Skeleton (Back button & title area) */}
        <View className={isDesktopLayout ? "w-full max-w-7xl mx-auto mt-4 px-5" : "mt-4 px-5"}>
          <Skeleton className="w-10 h-10 rounded-full mb-2" />
        </View>

        {/* Hero Image Carousel Skeleton */}
        <View className={isDesktopLayout ? "w-full max-w-7xl mx-auto px-5 mt-6" : "px-5 mt-5"}>
          <Skeleton
            className="w-full rounded-[2rem]"
            style={{ height: heroImageHeight }}
          />
        </View>

        <View className={isDesktopLayout ? "w-full max-w-7xl mx-auto px-5 mt-8 mb-12 flex-row gap-8 items-start" : "px-5 mt-6 mb-8 gap-6 w-full"}>
          {/* Left Column (Main Info) */}
          <View className={isDesktopLayout ? "flex-[0.65] gap-6" : "gap-6 w-full"}>
            
            {/* Title & Location Skeleton */}
            <View className="flex-row justify-between items-start flex-wrap gap-4">
              <View className="flex-1 min-w-[200px]">
                <View className="flex-row gap-2 mb-2">
                  <Skeleton className="w-20 h-6 rounded-full" />
                  <Skeleton className="w-20 h-6 rounded-full" />
                </View>
                <Skeleton className="w-3/4 h-8 mt-1 mb-2" />
                <Skeleton className="w-1/2 h-5 mt-1" />
              </View>
              {!isDesktopLayout && (
                <Skeleton className="w-32 h-10 rounded-xl" />
              )}
            </View>

            {/* Core Metrics Skeleton */}
            <View className="flex-row justify-between w-full bg-white border border-gray-100 shadow-sm shadow-gray-200 rounded-[24px] py-5 px-6 my-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} className="items-center flex-1">
                  <Skeleton className="w-8 h-8 rounded-full mb-2" />
                  <Skeleton className="w-10 h-5 mb-1" />
                  <Skeleton className="w-12 h-3" />
                </View>
              ))}
            </View>

            {/* Description Skeleton */}
            <View className="mt-2">
              <Skeleton className="w-40 h-4 mb-4" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-5/6 h-4 mb-2" />
              <Skeleton className="w-4/6 h-4" />
            </View>

            {/* Highlights Skeleton */}
            <View className="mt-4 gap-6">
              <View>
                <Skeleton className="w-32 h-4 mb-4" />
                <View className="flex-row flex-wrap gap-2">
                  <Skeleton className="w-24 h-8 rounded-full" />
                  <Skeleton className="w-32 h-8 rounded-full" />
                  <Skeleton className="w-28 h-8 rounded-full" />
                  <Skeleton className="w-20 h-8 rounded-full" />
                </View>
              </View>
            </View>
          </View>

          {/* Right Column (Sticky Sidebar for Web) */}
          {isDesktopLayout && (
            <View className="flex-[0.35] w-full">
              <View className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
                <Skeleton className="w-16 h-4 mb-2" />
                <Skeleton className="w-48 h-10 mb-6" />
                <Skeleton className="w-full h-14 rounded-[20px] mb-6" />
                <Skeleton className="w-full h-24 rounded-2xl" />
              </View>
            </View>
          )}
        </View>

        {/* Map Skeleton */}
        <View className={isDesktopLayout ? "w-full max-w-7xl mx-auto px-5 mb-12" : "px-5 mb-8 w-full"}>
          <Skeleton className="w-full h-64 rounded-3xl" />
        </View>
      </ScrollView>

      {/* Sticky Inquire Button (Mobile) */}
      {!isDesktopLayout && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
          <Skeleton className="w-full h-14 rounded-xl" />
        </View>
      )}
    </View>
  );
}
