import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";

const FEATURES = [
  {
    icon: "✅",
    title: "Verified Listings",
    description:
      "Every property is reviewed and verified by our local team before going live. No fake listings, no surprises.",
    color: "#1d4ed8",
    bg: "#eff6ff",
  },
  {
    icon: "🔍",
    title: "Smart Search & Filter",
    description:
      "Find exactly what you're looking for with powerful filters — by city, price, area, type, and availability.",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    icon: "📍",
    title: "Local Expertise",
    description:
      "Built specifically for Ilocos Sur. We know the towns, barangays, and neighborhoods like the back of our hand.",
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    icon: "🔔",
    title: "Always Up-to-Date",
    description:
      "Listings are updated in real-time. The moment a property is sold or available, you'll know.",
    color: "#d97706",
    bg: "#fffbeb",
  },
];

export default function WhyChooseUsSection() {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1050;

  const columns = isMobile ? 1 : isTablet ? 2 : 4;

  return (
    <View style={styles.section}>
      {/* Background accent */}
      <View style={styles.bgAccent} />

      <View style={[styles.inner, { maxWidth: 1200 }]}>
        {/* Section heading */}
        <View style={styles.headingWrap}>
          <Text style={styles.eyebrow}>WHY CHOOSE US</Text>
          <Text style={styles.title}>Everything You Need,{"\n"}In One Place</Text>
          <Text style={styles.subtitle}>
            We've built the most complete property discovery platform for Ilocos Sur —
            designed for buyers, sellers, and renters alike.
          </Text>
        </View>

        {/* Feature cards grid */}
        <View
          style={[
            styles.grid,
            {
              flexDirection: isMobile ? "column" : "row",
              flexWrap: isMobile ? "nowrap" : "wrap",
            },
          ]}
        >
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              // @ts-ignore
              className="feature-card"
              style={[
                styles.card,
                {
                  width: isMobile ? "100%" : isTablet ? "46%" : "22%",
                },
              ]}
            >
              {/* Icon circle */}
              <View style={[styles.iconCircle, { backgroundColor: feature.bg }]}>
                <Text style={styles.icon}>{feature.icon}</Text>
              </View>
              <Text style={[styles.cardTitle, { color: feature.color }]}>
                {feature.title}
              </Text>
              <Text style={styles.cardDesc}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    paddingVertical: 80,
    paddingHorizontal: 32,
    position: "relative",
    overflow: "hidden",
  },
  bgAccent: {
    position: "absolute",
    top: -60,
    right: -80,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#eff6ff",
    opacity: 0.6,
  },
  inner: {
    alignSelf: "center",
    width: "100%",
  },
  headingWrap: {
    alignItems: "center",
    marginBottom: 56,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3b82f6",
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    lineHeight: 44,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 520,
    lineHeight: 26,
  },
  grid: {
    justifyContent: "space-between",
    gap: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
    transitionDuration: "220ms" as any,
    transitionProperty: "transform, box-shadow" as any,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 26,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
  },
});
