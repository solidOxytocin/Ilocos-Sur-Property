import React, { useCallback, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import HeroSection from "./components/HeroSection";
import FeaturedPropertiesSection from "./components/FeaturedPropertiesSection";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import LocationHighlightsSection from "./components/LocationHighlightsSection";
import LandingFooter from "./components/LandingFooter";
import { getLandingScrollY, setLandingScrollY } from "./landingScrollState";

export default function LandingPage() {
  const scrollRef = useRef<ScrollView>(null);
  const savedScrollY = useRef(getLandingScrollY());
  /** Scroll offset to restore when returning; fixed for this mount until user scrolls. */
  const restoreTargetY = useRef(savedScrollY.current);
  const shouldAutoRestore = useRef(restoreTargetY.current > 0);

  const restoreScroll = useCallback(() => {
    if (!shouldAutoRestore.current) return;
    const y = restoreTargetY.current;
    if (y <= 0) return;
    scrollRef.current?.scrollTo({ y, animated: false });
  }, []);

  const persistScrollOffset = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    savedScrollY.current = y;
    setLandingScrollY(y);
    if (
      shouldAutoRestore.current &&
      restoreTargetY.current > 0 &&
      Math.abs(y - restoreTargetY.current) > 48
    ) {
      shouldAutoRestore.current = false;
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(restoreScroll);
    const stopAutoRestore = setTimeout(() => {
      shouldAutoRestore.current = false;
    }, 5000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(stopAutoRestore);
      setLandingScrollY(savedScrollY.current);
    };
  }, [restoreScroll]);

  const handleContentSizeChange = useCallback(() => {
    restoreScroll();
  }, [restoreScroll]);

  return (
    <View style={styles.root}>
      {Platform.OS === "web" && (
        <style>{`
          html, body, #root { margin: 0; padding: 0; height: 100%; overflow-x: hidden; }
          * { box-sizing: border-box; }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(32px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes landingScrollNudge {
            0%, 100% { transform: translateY(0); opacity: 0.65; }
            50% { transform: translateY(14px); opacity: 1; }
          }
          @keyframes landingEyebrowPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.5); }
            50% { transform: scale(1.12); box-shadow: 0 0 0 8px rgba(96, 165, 250, 0); }
          }
          @keyframes landingHeroKenBurns {
            0% { transform: scale(1); }
            100% { transform: scale(1.06); }
          }
          .landing-hero-kenburns {
            transform-origin: center center;
            animation: landingHeroKenBurns 32s ease-in-out infinite alternate;
          }
          .landing-scroll-dot {
            animation: landingScrollNudge 2.2s ease-in-out infinite;
          }
          .landing-eyebrow-dot {
            animation: landingEyebrowPulse 2.4s ease-in-out infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .landing-hero-kenburns,
            .landing-scroll-dot,
            .landing-eyebrow-dot {
              animation: none !important;
            }
          }
          .hero-cta-primary:hover { transform: scale(1.04); box-shadow: 0 8px 32px rgba(255,255,255,0.25); }
          .hero-cta-secondary:hover { transform: scale(1.02); background: rgba(255,255,255,0.18); }
          .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(29,78,216,0.13); }
          .location-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(29,78,216,0.15); }
          .property-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(0,0,0,0.14); }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        `}</style>
      )}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={persistScrollOffset}
        onScrollEndDrag={persistScrollOffset}
        onMomentumScrollEnd={persistScrollOffset}
        onContentSizeChange={handleContentSizeChange}
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
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
