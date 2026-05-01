import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
  Modal,
  Platform,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function LandingFooter() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 700;
  const [contactModalVisible, setContactModalVisible] = useState(false);

  // Contact agent helpers
  const openMobile = () => {
    const separator = Platform.OS === "ios" ? "&" : "?";
    Linking.openURL(`sms:09261849580${separator}body=${encodeURIComponent("Hi, I have a property I'd like to list. Please get in touch with me.")}`)
  };
  const openGmail = () => {
    if (Platform.OS === "web") {
      Linking.openURL(`https://mail.google.com/mail/?view=cm&fs=1&to=clarkadamarconado@gmail.com&su=${encodeURIComponent("Property Listing Inquiry")}&body=${encodeURIComponent("Hi, I have a property I'd like to list with Ilocos Sur Property. Please get in touch with me.")}`);
    } else {
      Linking.openURL(`mailto:clarkadamarconado@gmail.com?subject=${encodeURIComponent("Property Listing Inquiry")}&body=${encodeURIComponent("Hi, I have a property I'd like to list with Ilocos Sur Property. Please get in touch with me.")}`);
    }
  };
  const openFB = () => Linking.openURL("https://www.facebook.com/clark.arconado.1/");
  const openInstagram = () => Linking.openURL("https://www.instagram.com/clarkadam69/");

  return (
    <View style={styles.footer}>
      {/* Top CTA band */}
      <View style={styles.ctaBand}>
        <View style={[styles.ctaBandInner, { flexDirection: isMobile ? "column" : "row" }]}>
          <View style={styles.ctaBandText}>
            <Text style={styles.ctaBandTitle}>
              Have a property to sell?
            </Text>
            <Text style={styles.ctaBandSub}>
              List your property with us and reach thousands of potential buyers in Ilocos Sur.
            </Text>
          </View>
          <Pressable
            style={[styles.ctaBandBtn, { marginTop: isMobile ? 20 : 0, flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => setContactModalVisible(true)}
          >
            <Text style={[styles.ctaBandBtnText, { marginRight: 8 }]}>Contact Agent</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#1d4ed8" />
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
                source={require("../../../../assets/images/ilocos-sur-icon-white.png")}
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

      {/* ── Contact Agent Modal ─────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contactModalVisible}
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, maxWidth: 600, width: "100%", alignSelf: "center" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#1f2937" }}>Contact Agent</Text>
              <TouchableOpacity
                onPress={() => setContactModalVisible(false)}
                style={{ backgroundColor: "#f3f4f6", padding: 8, borderRadius: 100 }}
              >
                <MaterialCommunityIcons name="close" size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: "#eff6ff", padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#bfdbfe" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#1e40af", marginBottom: 4 }}>Clark Adam Arconado</Text>
              <Text style={{ fontSize: 12, color: "#2563eb", marginBottom: 2 }}>Email: clarkadamarconado@gmail.com</Text>
              <Text style={{ fontSize: 12, color: "#2563eb" }}>Mobile: 09261849580</Text>
            </View>

            <Text style={{ fontSize: 12, fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Send a message via
            </Text>

            <View style={{ gap: 10, marginBottom: 24 }}>
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  onPress={openMobile}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}
                  activeOpacity={0.7}
                >
                  <View style={{ backgroundColor: "#dcfce7", padding: 10, borderRadius: 100, marginRight: 16 }}>
                    <MaterialCommunityIcons name="message-text" size={22} color="#16a34a" />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>SMS / Messaging App</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={openGmail}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: "#fee2e2", padding: 10, borderRadius: 100, marginRight: 16 }}>
                  <MaterialCommunityIcons name="gmail" size={22} color="#ea4335" />
                </View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>Gmail</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openFB}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: "#dbeafe", padding: 10, borderRadius: 100, marginRight: 16 }}>
                  <MaterialCommunityIcons name="facebook" size={22} color="#1877f2" />
                </View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openInstagram}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f9fafb", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#e5e7eb" }}
                activeOpacity={0.7}
              >
                <View style={{ backgroundColor: "#fce7f3", padding: 10, borderRadius: 100, marginRight: 16 }}>
                  <MaterialCommunityIcons name="instagram" size={22} color="#e1306c" />
                </View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}>Instagram</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
