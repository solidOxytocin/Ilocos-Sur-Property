import React from "react";
import { View, useWindowDimensions } from "react-native";
import { Skeleton } from "../../generics/components/Skeleton";

interface PropertyCardSkeletonProps {
  viewMode: "grid" | "list";
}

export function PropertyCardSkeleton({ viewMode }: PropertyCardSkeletonProps) {
  const { width } = useWindowDimensions();
  const isHorizontalList = viewMode === "list" && width >= 768;

  if (viewMode === "grid") {
    return (
      <View
        className="bg-white shadow-sm border-gray-200 border flex-col rounded-xl overflow-hidden w-full"
        style={{ minHeight: 290 }}
      >
        {/* Image Placeholder */}
        <Skeleton className="w-full h-36 rounded-none" />

        {/* Content Placeholder */}
        <View className="flex-col p-3 justify-between" style={{ minHeight: 150 }}>
          <View>
            <View className="flex-1 flex-row items-center justify-center mb-1">
              <Skeleton className="w-24 h-5" />
            </View>
            <View className="flex-1 flex-row items-center justify-center mb-3">
              <Skeleton className="w-16 h-3" />
            </View>

            {/* Features Placeholders */}
            <View className="flex-row flex-wrap min-h-[44px] gap-1">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-12 h-6 rounded-full" />
            </View>
          </View>

          {/* Bottom Row */}
          <View className="flex-row justify-between items-center pt-2 mt-2 border-t border-gray-100">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-20 h-5" />
          </View>
        </View>
      </View>
    );
  }

  // List Mode
  return (
    <View
      className={`bg-white rounded-2xl m-2 shadow-sm border border-gray-100 overflow-hidden ${
        isHorizontalList ? "flex-row h-52" : "flex-col"
      }`}
    >
      <View className={`relative ${isHorizontalList ? "w-[45%] h-full" : "w-full h-52"}`}>
        <Skeleton className="w-full h-full rounded-none" />
      </View>

      <View className={`p-4 ${isHorizontalList ? "flex-1 justify-center" : ""}`}>
        {/* Header Row */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Skeleton className="w-32 h-6 mb-2" />
            <Skeleton className="w-20 h-4" />
          </View>

          <View className="items-end">
            <Skeleton className="w-24 h-6 mb-2" />
            <Skeleton className="w-16 h-5 rounded-md" />
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-gray-100 w-full my-3" />

        {/* Features Row */}
        <View className="flex-row flex-wrap gap-x-2 gap-y-1">
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </View>
      </View>
    </View>
  );
}
