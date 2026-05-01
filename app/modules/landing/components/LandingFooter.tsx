import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";

export default function LandingFooter() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  return (
    <View style={styles.footer}>
      {/* Top CTA band */}
      <View style={styles.ctaBand}>
        <View style={[styles.ctaBandInner, { flexDirection: isMobile ? "column" : "row" }]}>
          <View style={styles.ctaBandText}>
            <Text style={styles.ctaBandTitle}>
              Ready to find your perfect property?
            </Text>
            <Text style={styles.ctaBandSub}>
              Browse hundreds of verified listings in Ilocos Sur today.
            </Text>
          </View>
          <Pressable
            style={[styles.ctaBandBtn, { marginTop: isMobile ? 20 : 0 }]}
            onPress={() => router.push("/properties")}
          >
            <Text style={styles.ctaBandBtnText}>Browse Properties →</Text>
          </Pressable>
        </View>
      </View>

      {/* Footer body */}
      <View style={styles.body}>
        <View style={[styles.bodyInner, { flexDirection: isMobile ? "column" : "row" }]}>
          {/* Brand */}
          <View style={[styles.brandCol, { marginBottom: isMobile ? 32 : 0 }]}>
            <View style={styles.logoRow}>
              <Image
                source={require("../../../../assets/images/ilocos-sur-48x.jpg")}
                style={styles.logoImg}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>Ilocos Sur{"\n"}Property</Text>
            </View>
            <Text style={styles.tagline}>
              Your trusted guide to real estate in the heritage province of Ilocos Sur, Philippines.
            </Text>
          </View>

          {/* Links */}
          {!isMobile && (
            <View style={styles.linksRow}>
              <View style={styles.linkCol}>
                <Text style={styles.linkHeader}>Explore</Text>
                {([
                  { label: "All Properties",  params: {} },
                  { label: "For Sale",        params: { status: "AVAILABLE" } },
                  { label: "Lots",            params: { type: "LOT" } },
                  { label: "Houses",          params: { type: "HOUSE" } },
                  { label: "Commercial",      params: { type: "COMMERCIAL" } },
                ] as { label: string; params: Record<string, string> }[]).map(({ label, params }) => (
                  <Pressable
                    key={label}
                    onPress={() => router.push({ pathname: "/properties", params })}
                  >
                    <Text style={styles.linkItem}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.linkCol}>
                <Text style={styles.linkHeader}>Locations</Text>
                {(["Vigan City", "Candon City", "Narvacan", "Bantay", "Santa"].map((city) => (
                  <Pressable
                    key={city}
                    onPress={() => router.push({ pathname: "/properties", params: { city } })}
                  >
                    <Text style={styles.linkItem}>{city}</Text>
                  </Pressable>
                )))}
              </View>
            </View>
          )}
        </View>

        {/* Divider + copyright */}
        <View style={styles.divider} />
        <View style={[styles.bottomRow, { flexDirection: isMobile ? "column" : "row" }]}>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} Ilocos Sur Property. All rights reserved.
          </Text>
          <Text style={[styles.madeWith, { marginTop: isMobile ? 8 : 0 }]}>
            Made with ❤️ in Ilocos Sur, Philippines
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#0f172a",
  },
  ctaBand: {
    backgroundColor: "#1d4ed8",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  ctaBandInner: {
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ctaBandText: {
    flex: 1,
  },
  ctaBandTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  ctaBandSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
  },
  ctaBandBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    cursor: "pointer" as any,
  },
  ctaBandBtnText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 15,
  },
  body: {
    paddingVertical: 56,
    paddingHorizontal: 32,
  },
  bodyInner: {
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  brandCol: {
    maxWidth: 320,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoImg: {
    width: 48,
    height: 48,
  },
  logoText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
    lineHeight: 22,
  },
  tagline: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    lineHeight: 22,
  },
  linksRow: {
    flexDirection: "row",
    gap: 64,
  },
  linkCol: {
    gap: 10,
  },
  linkHeader: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  linkItem: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    cursor: "pointer" as any,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 32,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },
  bottomRow: {
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copyright: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
  madeWith: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
});
