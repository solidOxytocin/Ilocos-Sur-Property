import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getCityPropertyCounts } from "@/app/service/property-service";
import { DataFetchState } from "@/app/modules/generics/components/DataFetchState";

// Static definition of the towns we want to showcase.
// "cityKey" must match the city name in the database / mock data exactly.
const LOCATIONS: {
  cityKey: string;
  displayName: string;
  description: string;
  emoji: string;
  color: string;
  bg: string;
}[] = [
  {
    cityKey: "Vigan City",
    displayName: "Vigan City",
    description: "UNESCO World Heritage Site & cultural capital",
    emoji: "🏛️",
    color: "#1d4ed8",
    bg: "#eff6ff",
  },
  {
    cityKey: "Candon City",
    displayName: "Candon City",
    description: "The Tobacco City — growing commercial hub",
    emoji: "🌿",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    cityKey: "Narvacan",
    displayName: "Narvacan",
    description: "Coastal town with scenic Paoay Lake views",
    emoji: "🌊",
    color: "#0284c7",
    bg: "#f0f9ff",
  },
  {
    cityKey: "Bantay",
    displayName: "Bantay",
    description: "Home to the historic Bantay Bell Tower",
    emoji: "⛪",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    cityKey: "Santa",
    displayName: "Santa",
    description: "Agricultural heartland with rising real estate",
    emoji: "🌾",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    cityKey: "Tagudin",
    displayName: "Tagudin",
    description: "Gateway to southern Ilocos Sur",
    emoji: "🛣️",
    color: "#dc2626",
    bg: "#fef2f2",
  },
];

function LocationCard({
  loc,
  count,
  loading,
}: {
  loc: (typeof LOCATIONS)[0];
  count: number | null;
  loading: boolean;
}) {
  const router = useRouter();
  return (
    <Pressable
      // @ts-ignore
      className="location-card"
      style={[styles.card, { borderLeftColor: loc.color }]}
      onPress={() => router.push({ pathname: "/properties", params: { city: loc.cityKey } })}
    >
      <View style={[styles.emojiWrap, { backgroundColor: loc.bg }]}>
        <Text style={styles.emoji}>{loc.emoji}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardName, { color: loc.color }]}>{loc.displayName}</Text>
        <Text style={styles.cardDesc}>{loc.description}</Text>
        <View style={styles.countBadge}>
          {loading ? (
            <ActivityIndicator size="small" color={loc.color} style={{ height: 16 }} />
          ) : (
            <Text style={styles.countText}>
              {count !== null && count > 0 ? `${count} listing${count === 1 ? "" : "s"}` : "No listings yet"}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function LocationHighlightsSection() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1050;

  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [countsError, setCountsError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setCountsError(null);
      const result = await getCityPropertyCounts();
      if (cancelled) return;
      if (!result.ok) {
        setCountsError(result.error.message);
        setCityCounts({});
      } else {
        setCityCounts(result.data);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [retryKey]);

  return (
    <View style={styles.section}>
      {/* Decorative blob */}
      <View style={styles.blob} />

      <View style={styles.inner}>
        {/* Section heading */}
        <View style={styles.headingWrap}>
          <Text style={styles.eyebrow}>EXPLORE BY LOCATION</Text>
          <Text style={styles.title}>Top Destinations in Ilocos Sur</Text>
          <Text style={styles.subtitle}>
            From the heritage streets of Vigan to the coastal shores of Narvacan —
            find your perfect spot anywhere in the province.
          </Text>
        </View>

        {countsError ? (
          <DataFetchState
            variant="error"
            title="Couldn’t load location stats"
            message={countsError}
            onRetry={() => setRetryKey((k) => k + 1)}
            retryLabel="Try again"
            compact
          />
        ) : null}

        {/* Grid */}
        <View style={[styles.grid, { flexDirection: "row", flexWrap: "wrap" }]}>
          {LOCATIONS.map((loc) => (
            <View
              key={loc.cityKey}
              style={{
                width: isMobile ? "100%" : isTablet ? "48%" : "31%",
                marginBottom: 20,
              }}
            >
              <LocationCard
                loc={loc}
                count={cityCounts[loc.cityKey] ?? null}
                loading={loading && !countsError}
              />
            </View>
          ))}
        </View>

        {/* Browse all CTA */}
        <View style={styles.ctaWrap}>
          <Text style={styles.ctaLabel}>
            Don't see your town? We cover all{" "}
            {loading ? "—" : Object.keys(cityCounts).length} municipalities.
          </Text>
          <Pressable
            style={styles.ctaBtn}
            // @ts-ignore
            onPress={() => {}}
          >
            <Text style={styles.ctaBtnText}>View All Locations →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#f8fafc",
    paddingVertical: 80,
    paddingHorizontal: 32,
    position: "relative",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#dbeafe",
    opacity: 0.5,
  },
  inner: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },
  headingWrap: {
    alignItems: "center",
    marginBottom: 48,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3b82f6",
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 540,
    lineHeight: 24,
  },
  grid: {
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    transitionDuration: "200ms" as any,
    transitionProperty: "transform, box-shadow" as any,
    cursor: "pointer" as any,
  },
  emojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    flexShrink: 0,
  },
  emoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 18,
  },
  countBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    minWidth: 80,
    alignItems: "center",
  },
  countText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  ctaWrap: {
    marginTop: 40,
    alignItems: "center",
  },
  ctaLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 14,
  },
  ctaBtn: {
    borderWidth: 2,
    borderColor: "#1d4ed8",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    cursor: "pointer" as any,
  },
  ctaBtnText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 14,
  },
});
