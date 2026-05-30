import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { getCityPropertyCounts } from "@/app/service/property-service";

/** Format a raw number into a compact display string, e.g. 15 → "15", 1500 → "1.5K+" */
function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  return String(n);
}

export default function HeroSection() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  const [totalListings, setTotalListings] = useState<number | null>(null);
  const [totalTowns, setTotalTowns] = useState<number | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsRetryKey, setStatsRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getCityPropertyCounts();
      if (cancelled) return;
      if (!result.ok) {
        setStatsError(result.error.message);
        setTotalListings(null);
        setTotalTowns(null);
        return;
      }
      setStatsError(null);
      const counts = result.data;
      const listings = Object.values(counts).reduce((sum, n) => sum + n, 0);
      const towns = Object.keys(counts).length;
      setTotalListings(listings);
      setTotalTowns(towns);
    })();
    return () => { cancelled = true; };
  }, [statsRetryKey]);

  const heroEase = Platform.OS === "web" ? ({ animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" } as const) : {};
  const minHeroH = isMobile ? 520 : height * 0.88;

  return (
    <View style={[styles.hero, { minHeight: minHeroH }]}>
      {/* Background only — Ken Burns / scale does not affect text or overlays */}
      <ImageBackground
        source={require("../../../../assets/images/hero-bg.png")}
        // @ts-ignore — web: RN Web forwards className for CSS animation
        className={Platform.OS === "web" ? "landing-hero-kenburns" : undefined}
        style={styles.heroBg}
        resizeMode="cover"
      >
        <View style={styles.heroBgFill} />
      </ImageBackground>
      <View style={styles.gradientOverlay} pointerEvents="none" />
      <View style={styles.gradientOverlayTop} pointerEvents="none" />

      {/* Content */}
      <View style={[styles.content, { paddingHorizontal: isMobile ? 24 : 64 }]}>
        {/* Eyebrow label */}
        <View
          // @ts-ignore
          style={[
            styles.eyebrow,
            {
              animationName: "fadeIn",
              animationDuration: "0.8s",
              animationFillMode: "both",
              ...heroEase,
            },
          ]}
        >
          <View
            // @ts-ignore
            className={Platform.OS === "web" ? "landing-eyebrow-dot" : undefined}
            style={styles.eyebrowDot}
          />
          <Text style={styles.eyebrowText}>Ilocos Sur's #1 Property Platform</Text>
        </View>

        {/* Headline */}
        <Text
          style={[
            styles.headline,
            { fontSize: isMobile ? 34 : 62 },
            // @ts-ignore
            {
              animationName: "fadeInUp",
              animationDuration: "0.9s",
              animationDelay: "0.1s",
              animationFillMode: "both",
              ...heroEase,
            },
          ]}
        >
          Find Your Dream{"\n"}Property in{" "}
          <Text
            style={[
              styles.headlineAccent,
              ...(Platform.OS === "web"
                ? [
                    {
                      animationName: "fadeInUp",
                      animationDuration: "0.85s",
                      animationDelay: "0.28s",
                      animationFillMode: "both",
                      display: "inline" as const,
                      ...heroEase,
                    },
                  ]
                : []),
            ]}
          >
            Ilocos Sur
          </Text>
        </Text>

        {/* Subtitle */}
        <Text
          style={[
            styles.subtitle,
            { fontSize: isMobile ? 15 : 18, maxWidth: isMobile ? "100%" : 560 },
            // @ts-ignore
            {
              animationName: "fadeInUp",
              animationDuration: "0.9s",
              animationDelay: "0.25s",
              animationFillMode: "both",
              ...heroEase,
            },
          ]}
        >
          Explore verified residential, commercial, and lot listings across
          Vigan, Candon, Narvacan, and beyond — from trusted local sellers.
        </Text>

        {/* Stats row */}
        <View
          style={[
            styles.statsRow,
            // @ts-ignore
            {
              animationName: "fadeInUp",
              animationDuration: "0.9s",
              animationDelay: "0.35s",
              animationFillMode: "both",
              ...heroEase,
            },
          ]}
        >
          {[
            {
              value: totalListings !== null ? formatStat(totalListings) : "—",
              label: "Listings",
            },
            {
              value: totalTowns !== null ? String(totalTowns) : "—",
              label: "Towns Covered",
            },
            { value: "100%", label: "Verified" },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
        {statsError ? (
          <View style={{ marginTop: 12, alignItems: isMobile ? "stretch" : "flex-start" }}>
            <Text style={{ color: "#fecaca", fontSize: 13, marginBottom: 6 }}>{statsError}</Text>
            <Pressable
              onPress={() => setStatsRetryKey((k) => k + 1)}
              style={{
                alignSelf: isMobile ? "center" : "flex-start",
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {/* CTA Button */}
        <View
          style={[
            styles.ctaRow,
            // @ts-ignore
            {
              animationName: "fadeInUp",
              animationDuration: "0.9s",
              animationDelay: "0.45s",
              animationFillMode: "both",
              ...heroEase,
            },
          ]}
        >
          <Pressable
            // @ts-ignore
            className="hero-cta-secondary"
            style={styles.ctaSecondary}
            onPress={() => router.push("/properties")}
          >
            <Text style={styles.ctaSecondaryText}>Explore Listings →</Text>
          </Pressable>
        </View>
      </View>

      {/* Scroll indicator */}
      <View
        // @ts-ignore
        style={[
          styles.scrollIndicator,
          Platform.OS === "web" && {
            animationName: "fadeIn",
            animationDuration: "1s",
            animationDelay: "0.65s",
            animationFillMode: "both",
            ...heroEase,
          },
        ]}
      >
        <View
          // @ts-ignore
          className={Platform.OS === "web" ? "landing-scroll-dot" : undefined}
          style={styles.scrollDot}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBgFill: {
    flex: 1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 25, 60, 0.68)",
  },
  gradientOverlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(15, 30, 80, 0.45)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 64,
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
    zIndex: 1,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#60a5fa",
    marginRight: 10,
  },
  eyebrowText: {
    color: "#93c5fd",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headline: {
    color: "#ffffff",
    fontWeight: "800",
    lineHeight: 68,
    marginBottom: 20,
    letterSpacing: -1,
  },
  headlineAccent: {
    color: "#60a5fa",
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: 28,
    marginBottom: 32,
    fontWeight: "400",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 36,
    gap: 32,
  },
  statItem: {
    alignItems: "flex-start",
  },
  statValue: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 30,
  },
  statLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  ctaRow: {
    alignItems: "flex-start",
  },
  ctaPrimary: {
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    transitionDuration: "200ms" as any,
    transitionProperty: "transform, box-shadow" as any,
    cursor: "pointer" as any,
  },
  ctaPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  ctaSecondary: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    transitionDuration: "200ms" as any,
    transitionProperty: "transform, background" as any,
    cursor: "pointer" as any,
  },
  ctaSecondaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: 28,
    left: "50%",
    transform: [{ translateX: -8 }],
    alignItems: "center",
    zIndex: 2,
  },
  scrollDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "transparent",
  },
});
