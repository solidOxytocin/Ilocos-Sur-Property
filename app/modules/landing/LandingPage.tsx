import React, { useRef } from "react";
import { ScrollView, StyleSheet, View, Platform } from "react-native";
import HeroSection from "./components/HeroSection";
import FeaturedPropertiesSection from "./components/FeaturedPropertiesSection";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import LocationHighlightsSection from "./components/LocationHighlightsSection";
import LandingFooter from "./components/LandingFooter";

export default function LandingPage() {
  const featuredRef = useRef<ScrollView>(null);

  return (
    <View style={styles.root}>
      {Platform.OS === "web" && (
        <style>{`
          html, body, #root { margin: 0; padding: 0; height: 100%; }
          * { box-sizing: border-box; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(32px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          .hero-cta-primary:hover { transform: scale(1.04); box-shadow: 0 8px 32px rgba(255,255,255,0.25); }
          .hero-cta-secondary:hover { background: rgba(255,255,255,0.18); }
          .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(29,78,216,0.13); }
          .location-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(29,78,216,0.15); }
          .property-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,0.14); }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        `}</style>
      )}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection />
        <FeaturedPropertiesSection />
        <WhyChooseUsSection />
        <LocationHighlightsSection />
        <LandingFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
