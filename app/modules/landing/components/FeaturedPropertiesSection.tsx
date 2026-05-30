import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getPropertiesPaginated, propertyListFromPaginatedOk } from "@/app/service/property-service";
import type { Property } from "@/app/constants/mock/mock-properties";
import { API_USER_MESSAGES } from "@/app/lib/api-result";
import { DataFetchState } from "@/app/modules/generics/components/DataFetchState";
import { Skeleton } from "@/app/modules/generics/components/Skeleton";

const FEATURED_COUNT = 6;

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `₱${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `₱${(price / 1_000).toFixed(0)}K`;
  return `₱${price}`;
}

function PropertyCard({ property }: { property: any }) {
  const router = useRouter();
  const firstImage = property.media?.[0]?.url ?? null;
  const typeColor =
    property.type === "house"
      ? "#1d4ed8"
      : property.type === "lot"
      ? "#059669"
      : property.type === "condo"
      ? "#7c3aed"
      : "#d97706";

  return (
    <Pressable
      // @ts-ignore
      className="property-card"
      style={styles.card}
      onPress={() => router.push({ pathname: "/properties", params: { id: property.id } })}
    >
      {/* Image */}
      <View style={styles.cardImageWrap}>
        {firstImage ? (
          <Image source={{ uri: firstImage }} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Text style={styles.cardImageIcon}>🏠</Text>
          </View>
        )}
        {/* Type pill */}
        <View style={[styles.typePill, { backgroundColor: typeColor }]}>
          <Text style={styles.typePillText}>{property.type?.toUpperCase()}</Text>
        </View>
        {/* Status dot */}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: property.status === "available" ? "#22c55e" : "#f59e0b" },
          ]}
        />
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardPrice}>{formatPrice(property.price)}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {property.title}
        </Text>
        <Text style={styles.cardLocation} numberOfLines={1}>
          📍 {property.location?.barangay}, {property.location?.city}
        </Text>
        {property.lotArea && (
          <Text style={styles.cardArea}>📐 {property.lotArea} sqm</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function FeaturedPropertiesSection() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFetchError(null);
      const result = await getPropertiesPaginated({}, 1, FEATURED_COUNT);
      if (cancelled) return;
      if (!result.ok) {
        setFetchError(result.error.message);
        setFeatured([]);
      } else {
        setFeatured(propertyListFromPaginatedOk(result.data));
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [retryKey]);

  return (
    <View style={styles.section}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>HAND-PICKED LISTINGS</Text>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <Text style={styles.sectionSubtitle}>
            Top picks from across Ilocos Sur — updated regularly.
          </Text>
        </View>
        <Pressable style={styles.viewAllBtn} onPress={() => router.push("/properties")}>
          <Text style={styles.viewAllText}>View All →</Text>
        </Pressable>
      </View>

      {/* Cards */}
      {loading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardRow}
        >
          {Array.from({ length: FEATURED_COUNT }).map((_, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardImageWrap}>
                <Skeleton className="w-full h-full rounded-none" />
              </View>
              <View style={styles.cardBody}>
                <Skeleton className="w-24 h-6 mb-2" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-3/4 h-3 mb-2" />
                <Skeleton className="w-16 h-3" />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : fetchError ? (
        <DataFetchState
          variant="error"
          title="Couldn’t load featured listings"
          message={fetchError}
          onRetry={() => setRetryKey((k) => k + 1)}
          retryLabel="Try again"
          compact
        />
      ) : featured.length === 0 ? (
        <View style={{ paddingVertical: 24 }}>
          <Text style={{ textAlign: "center", color: "#64748b", fontSize: 15 }}>
            {API_USER_MESSAGES.noListings}
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardRow}
        >
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#f8fafc",
    paddingVertical: 72,
    paddingHorizontal: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 32,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3b82f6",
    letterSpacing: 2,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "400",
  },
  viewAllBtn: {
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    cursor: "pointer" as any,
  },
  viewAllText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  cardRow: {
    paddingHorizontal: 0,
    paddingBottom: 8,
    gap: 20,
  },
  card: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    transitionDuration: "220ms" as any,
    transitionProperty: "transform, box-shadow" as any,
    cursor: "pointer" as any,
  },
  cardImageWrap: {
    position: "relative",
    height: 180,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageIcon: {
    fontSize: 40,
  },
  typePill: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typePillText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  statusDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardBody: {
    padding: 16,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1d4ed8",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 20,
  },
  cardLocation: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  cardArea: {
    fontSize: 12,
    color: "#94a3b8",
  },
  loadingWrap: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
});
