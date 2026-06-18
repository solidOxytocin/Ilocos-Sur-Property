import { size } from "@/app/theme/size";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Property } from "../../../constants/mock/mock-properties";
import { copyToClipboard } from "../../../lib/copy-to-clipboard";
import {
  getPropertyShareUrl,
  shareToFacebook,
  shareToInstagram,
  shareToMessenger,
  shareViaNative,
} from "../../../lib/share-property";

interface HeaderProps {
  properties: Property;
  onClose?: () => void;
}

export default function DetailsHeader({ properties, onClose }: HeaderProps) {
  const [shareVisible, setShareVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const isDesktopLayout = Platform.OS === "web" && screenWidth >= 1024;

  const shareUrl = getPropertyShareUrl(properties?.id);
  const shareTitle = properties?.title || "Ilocos Sur Property";

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const flashCopied = (which: "url" | "insta") => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    if (which === "url") {
      setCopied(true);
      setInstaCopied(false);
    } else {
      setInstaCopied(true);
      setCopied(false);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      setInstaCopied(false);
    }, 2000);
  };

  const handleCopyUrl = async () => {
    try {
      await copyToClipboard(shareUrl);
      flashCopied("url");
    } catch {
      setCopied(false);
    }
  };

  const handleInstagram = async () => {
    try {
      await shareToInstagram(shareUrl);
      flashCopied("insta");
    } catch {
      setInstaCopied(false);
    }
  };

  const handleNativeShare = async () => {
    const shared = await shareViaNative(shareUrl, shareTitle);
    if (shared) setShareVisible(false);
  };

  return (
    <View className="flex-row px-4 py-3 border-b border-gray-200 items-center">
      {onClose ? (
        <TouchableOpacity
          className="mr-4"
          onPress={onClose}
        >
          <MaterialCommunityIcons name="close" size={size.headerIcon} color="black" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className="mr-4"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/properties");
            }
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={size.headerIcon} color="black" />
        </TouchableOpacity>
      )}
      <Text className="text-xl font-bold flex-1 text-center text-blue-600" numberOfLines={2}>
        {properties.title || "Untitled Property"}
      </Text>

      <TouchableOpacity
        className="ml-4 w-8 items-end"
        onPress={() => setShareVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Share this property"
        // @ts-ignore — web pointer cursor
        style={Platform.OS === "web" ? ({ cursor: "pointer" } as const) : undefined}
      >
        <MaterialCommunityIcons name="share-variant" size={size.headerIcon} color="#2563eb" />
      </TouchableOpacity>

      {/* ── Share Modal ──────────────────────────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={shareVisible}
        onRequestClose={() => setShareVisible(false)}
      >
        <View className={`flex-1 ${isDesktopLayout ? "justify-center items-center" : "justify-end"}`}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            className="bg-black/50"
            onPress={() => setShareVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close share dialog"
          />
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-auto"
          >
            <View className={`bg-white p-5 shadow-xl ${isDesktopLayout ? "rounded-2xl" : "rounded-t-2xl"}`}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-extrabold text-gray-900">Share this property</Text>
                <TouchableOpacity
                  onPress={() => setShareVisible(false)}
                  className="bg-gray-100 p-1.5 rounded-full"
                  accessibilityLabel="Close share dialog"
                >
                  <MaterialCommunityIcons name="close" size={18} color="#4b5563" />
                </TouchableOpacity>
              </View>

              <View className="flex-row flex-wrap justify-around mb-4">
                <ShareOption
                  icon="facebook"
                  color="#1877f2"
                  label="Facebook"
                  onPress={() => shareToFacebook(shareUrl)}
                />
                <ShareOption
                  icon="facebook-messenger"
                  color="#0084ff"
                  label="Messenger"
                  onPress={() => shareToMessenger(shareUrl)}
                />
                <ShareOption
                  icon="instagram"
                  color="#e1306c"
                  label={instaCopied ? "Copied!" : "Instagram"}
                  onPress={handleInstagram}
                />
                {Platform.OS !== "web" && (
                  <ShareOption
                    icon="dots-horizontal-circle-outline"
                    color="#4b5563"
                    label="More"
                    onPress={handleNativeShare}
                  />
                )}
              </View>

              <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Or copy link
              </Text>
              <TouchableOpacity
                onPress={handleCopyUrl}
                activeOpacity={0.75}
                className="flex-row items-center bg-gray-50 py-2.5 px-3 rounded-xl border border-gray-200"
                accessibilityRole="button"
                accessibilityLabel="Copy property link"
                // @ts-ignore — web pointer cursor
                style={Platform.OS === "web" ? ({ cursor: "pointer" } as const) : undefined}
              >
                <Text className="text-sm text-gray-600 flex-1 mr-2" numberOfLines={1}>
                  {shareUrl}
                </Text>
                <View className="flex-row items-center shrink-0">
                  <Text
                    className={`text-xs mr-1.5 ${
                      copied ? "text-green-600 font-semibold" : "text-blue-600 font-medium"
                    }`}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Text>
                  <MaterialCommunityIcons
                    name={copied ? "check" : "content-copy"}
                    size={18}
                    color={copied ? "#16a34a" : "#2563eb"}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function ShareOption({
  icon,
  color,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="items-center px-2 py-1"
      accessibilityRole="button"
      accessibilityLabel={label}
      // @ts-ignore — web pointer cursor
      style={Platform.OS === "web" ? ({ cursor: "pointer" } as const) : undefined}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-1"
        style={{ backgroundColor: `${color}1A` }}
      >
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Text className="text-xs font-medium text-gray-700">{label}</Text>
    </TouchableOpacity>
  );
}
