import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, ScrollView, Modal, Linking, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DetailsHeader from "./detailsHeader";
import Pill from "../../generics/components/pill";
import {
  EMPTY_ICON_KEY,
  FEATURE_ICONS,
  AMENITY_ICONS,
} from "../../property-list/constants/material-icon-names";
import { Property } from "../../../constants/mock/mock-properties";
import { size } from "../../../theme/size";
import PropertyMapView from "./propertyMapView";

interface PropertyDetailsContentProps {
  property: Property;
  onClose?: () => void;
}

export default function PropertyDetailsContent({ property, onClose }: PropertyDetailsContentProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const isSold = property?.status?.toUpperCase() === "SOLD";

  const propertyAddress = property?.location?.address ? `${property.location.address}, ` : "";
  const propertyBarangay = property?.location?.barangay ? `${property.location.barangay}, ` : "";
  const propertyCity = property?.location?.city ? `${property.location.city}` : "";
  const fullLocation = (propertyAddress + propertyBarangay + propertyCity).trim() || "this property";
  const messageBody = `Hi, I am interested in the property: ${fullLocation}. Please give me more details.`;

  const openMobile = () => {
    const separator = Platform.OS === "ios" ? "&" : "?";
    Linking.openURL(`sms:09261849580${separator}body=${encodeURIComponent(messageBody)}`);
  };

  const subjectLocation = [property?.location?.barangay, property?.location?.city].filter(Boolean).join(", ");
  const emailSubject = `Ilocos Sur Property${subjectLocation ? ` : ${subjectLocation}` : ""}`;

  const openGmail = () => {
    if (Platform.OS === "web") {
      Linking.openURL(
        `https://mail.google.com/mail/?view=cm&fs=1&to=clarkadamarconado@gmail.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(messageBody)}`
      );
    } else {
      Linking.openURL(
        `mailto:clarkadamarconado@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(messageBody)}`
      );
    }
  };

  const openFB = () => Linking.openURL("https://www.facebook.com/clark.arconado.1/");
  const openInstagram = () => Linking.openURL("https://www.instagram.com/clarkadam69/");

  const ICON_SIZE = size.pillDetailsIcon;

  // ─── Lightbox ─────────────────────────────────────────────────────────
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  const mediaCount = property?.media?.length ?? 0;
  const lightboxPrev = () => setLightboxIndex((i) => (i - 1 + mediaCount) % mediaCount);
  const lightboxNext = () => setLightboxIndex((i) => (i + 1) % mediaCount);

  // ─── Web mouse-drag carousel ──────────────────────────────────────────
  const carouselScrollRef = React.useRef<ScrollView>(null);
  const isDragging = React.useRef(false);
  const dragMoved = React.useRef(false);
  const dragStartX = React.useRef(0);
  const scrollStartX = React.useRef(0);
  const currentScrollX = React.useRef(0);

  // Gets the underlying DOM scrollable element on web
  const getDomScrollNode = (): HTMLElement | null => {
    if (Platform.OS !== "web") return null;
    try {
      const ref = carouselScrollRef.current as any;
      return ref?._scrollRef ?? ref?._nativeRef ?? null;
    } catch {
      return null;
    }
  };

  // Props spread onto a wrapper View only on web
  const webWrapperProps: any =
    Platform.OS === "web"
      ? {
          onMouseDown: (e: any) => {
            isDragging.current = true;
            dragMoved.current = false;
            dragStartX.current = e.clientX;
            scrollStartX.current = currentScrollX.current;
            e.preventDefault();
          },
          onMouseMove: (e: any) => {
            if (!isDragging.current) return;
            const delta = dragStartX.current - e.clientX;
            if (Math.abs(delta) > 4) dragMoved.current = true;
            const node = getDomScrollNode();
            if (node) node.scrollLeft = scrollStartX.current + delta;
          },
          onMouseUp: (e: any) => {
            if (!isDragging.current) return;
            isDragging.current = false;
            const delta = dragStartX.current - e.clientX;
            if (!dragMoved.current || Math.abs(delta) < 8) {
              // Treat as a click -> open lightbox
              openLightbox(activeSlide);
              return;
            }
            if (Math.abs(delta) > 40 && containerWidth > 0) {
              const dir = delta > 0 ? 1 : -1;
              const next = Math.max(0, Math.min(mediaCount - 1, activeSlide + dir));
              setActiveSlide(next);
              (carouselScrollRef.current as any)?.scrollTo?.({ x: next * containerWidth, animated: true });
            } else {
              (carouselScrollRef.current as any)?.scrollTo?.({ x: activeSlide * containerWidth, animated: true });
            }
          },
          onMouseLeave: (e: any) => {
            if (!isDragging.current) return;
            isDragging.current = false;
            const delta = dragStartX.current - e.clientX;
            if (dragMoved.current && Math.abs(delta) > 40 && containerWidth > 0) {
              const dir = delta > 0 ? 1 : -1;
              const next = Math.max(0, Math.min(mediaCount - 1, activeSlide + dir));
              setActiveSlide(next);
              (carouselScrollRef.current as any)?.scrollTo?.({ x: next * containerWidth, animated: true });
            } else {
              (carouselScrollRef.current as any)?.scrollTo?.({ x: activeSlide * containerWidth, animated: true });
            }
          },
          style: { cursor: "grab", userSelect: "none" } as any,
        }
      : {};

  return (
    <View className="flex-1 relative bg-white">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <DetailsHeader properties={property} onClose={onClose} />

        {/* Image Carousel */}
        <View className="px-5 mt-5">
          <View
            className="shadow-lg shadow-gray-300 rounded-[2rem] bg-gray-100 overflow-hidden relative"
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            {/* Mouse-drag wrapper (web only); on native this is a transparent View */}
            <View {...webWrapperProps}>
              <ScrollView
                ref={carouselScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                // On web, let mouse events control scrolling; disable native touch-scroll
                scrollEnabled={Platform.OS !== "web"}
                onScroll={(e) => {
                  currentScrollX.current = e.nativeEvent.contentOffset.x;
                  if (containerWidth > 0) {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
                    if (idx !== activeSlide) setActiveSlide(idx);
                  }
                }}
              >
                {property?.media?.map((media, index) =>
                  Platform.OS !== "web" ? (
                    // Native: wrap in TouchableOpacity for lightbox tap
                    <TouchableOpacity
                      key={media.id || index}
                      activeOpacity={0.9}
                      onPress={() => openLightbox(index)}
                      style={{ width: containerWidth > 0 ? containerWidth : undefined }}
                    >
                      <View>
                        <Image
                          source={{ uri: media.url }}
                          style={[
                            { width: containerWidth > 0 ? containerWidth : "100%", height: 288 },
                            isSold ? { opacity: 0.45 } : undefined
                          ]}
                          className="bg-gray-200"
                          resizeMode="cover"
                        />
                        {/* Grayscale overlay for sold properties */}
                        {isSold && (
                          <View
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(120,120,120,0.45)",
                            }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  ) : (
                    // Web: click handled by onMouseUp above
                    <View key={media.id || index} style={{ width: containerWidth > 0 ? containerWidth : "100%" }}>
                      <Image
                        source={{ uri: media.url }}
                        style={[
                          { width: containerWidth > 0 ? containerWidth : "100%", height: 288 },
                          isSold ? { opacity: 0.45 } : undefined
                        ]}
                        className="bg-gray-200"
                        resizeMode="cover"
                      />
                      {/* Grayscale overlay for sold properties */}
                      {isSold && (
                        <View
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(120,120,120,0.45)",
                          }}
                        />
                      )}
                    </View>
                  )
                )}
              </ScrollView>
            </View>

            {/* Expand icon hint */}
            {mediaCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(0,0,0,0.38)",
                  borderRadius: 100,
                  padding: 6,
                  pointerEvents: "none",
                }}
              >
                <MaterialCommunityIcons name="arrow-expand-all" size={15} color="white" />
              </View>
            )}

            {/* Dot indicators */}
            {mediaCount > 1 && (
              <View
                className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2"
                style={{ pointerEvents: "none" } as any}
              >
                {property.media.map((_, i) => (
                  <View
                    key={i}
                    className={`h-2 rounded-full ${i === activeSlide ? "w-4 bg-white" : "w-2 bg-white/60"}`}
                  />
                ))}
              </View>
            )}

            {/* Sold Banner Overlay */}
            {isSold && (
              <View 
                className="absolute left-0 right-0 items-center justify-center pointer-events-none"
                style={{ bottom: 40 }}
              >
                <View className="bg-red-600/90 px-8 py-2 rounded-lg shadow-lg ">
                  <Text className="text-white font-black text-3xl tracking-widest uppercase">
                  SOLD
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 mt-6 mb-8 gap-6">
          {/* Title & Price */}
          <View className="flex-row justify-between items-start flex-wrap gap-4">
            <View className="flex-1 min-w-[200px]">
              {!onClose ? (
                <View className="flex-row gap-2 mb-2">
                  <Pill
                    text={property?.type?.toUpperCase() || "PROPERTY"}
                    icon="home-city"
                    iconSize={14}
                    textSize="text-xs"
                    backGroundColor="bg-purple-600"
                  />
                  <Pill
                    text={property?.status?.toUpperCase() || "AVAILABLE"}
                    icon="check-circle"
                    iconSize={14}
                    textSize="text-xs"
                    backGroundColor={
                      property?.status?.toUpperCase() === "SOLD"
                        ? "bg-red-600"
                        : property?.status?.toUpperCase() === "RESERVED"
                        ? "bg-yellow-600"
                        : "bg-teal-600"
                    }
                  />
                </View>
              ) : (
                <View />
              )}

              <Text className="text-2xl font-extrabold text-gray-800 tracking-tight leading-tight mt-1">
                {property?.location.address}
              </Text>
              <Text className="text-base text-gray-500 mt-1 font-medium">
                {property?.location.barangay}, {property?.location.city}
              </Text>
            </View>
            <View className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
              <Text className="text-xl font-bold text-blue-700">
                &#x20B1;{property?.price.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Core Metrics */}
          <View className="flex-row justify-between w-full bg-white border border-gray-100 shadow-sm shadow-gray-200 rounded-[24px] py-5 px-6 my-2">
            <View className="items-center flex-1">
              <MaterialCommunityIcons name="texture-box" size={26} color="#9ca3af" />
              <Text className="text-base font-bold text-gray-800 mt-2">
                {property?.lotArea != null ? (
                  <>
                    {property.lotArea}
                    <Text className="text-[10px] text-gray-500 font-semibold ml-1">SQM</Text>
                  </>
                ) : (
                  "—"
                )}
              </Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Lot</Text>
            </View>
            <View className="items-center flex-1">
              <MaterialCommunityIcons name="floor-plan" size={26} color="#9ca3af" />
              <Text className="text-base font-bold text-gray-800 mt-2">
                {property?.floorArea != null ? (
                  <>
                    {property.floorArea}
                    <Text className="text-[10px] text-gray-500 font-semibold ml-1">SQM</Text>
                  </>
                ) : (
                  "—"
                )}
              </Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Floor</Text>
            </View>
            <View className="items-center flex-1">
              <MaterialCommunityIcons name="bed-empty" size={26} color="#9ca3af" />
              <Text className="text-base font-bold text-gray-800 mt-2">
                {property?.bedrooms ?? (property as any)?.bedRooms ?? "—"}
              </Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Beds</Text>
            </View>
            <View className="items-center flex-1">
              <MaterialCommunityIcons name="shower" size={26} color="#9ca3af" />
              <Text className="text-base font-bold text-gray-800 mt-2">
                {property?.bathrooms ?? (property as any)?.bathRooms ?? "—"}
              </Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Baths</Text>
            </View>
            <View className="items-center flex-1">
              <MaterialCommunityIcons name="car" size={26} color="#9ca3af" />
              <Text className="text-base font-bold text-gray-800 mt-2">{property?.parking ?? "—"}</Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Parking</Text>
            </View>
          </View>

          {/* Description */}
          <View className="mt-2">
            <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">
              About this property
            </Text>
            <Text className="text-base text-gray-600 leading-relaxed">{property?.details}</Text>
          </View>

          {/* Highlights & Amenities */}
          <View className="mt-4 gap-6">
            {property?.features?.length > 0 && (
              <View>
                <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Highlights</Text>
                <View className="flex-row flex-wrap gap-2">
                  {property.features.map((feature, index) => (
                    <Pill
                      key={`feat-${index}`}
                      text={feature.name}
                      icon={FEATURE_ICONS[feature.key] ?? FEATURE_ICONS[EMPTY_ICON_KEY]}
                      iconSize={16}
                      textSize="text-xs"
                    />
                  ))}
                </View>
              </View>
            )}

            {property?.amenities?.length > 0 && (
              <View>
                <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Amenities</Text>
                <View className="flex-row flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Pill
                      key={`ame-${index}`}
                      text={amenity.name}
                      icon={AMENITY_ICONS[amenity.key] ?? AMENITY_ICONS[EMPTY_ICON_KEY]}
                      iconSize={16}
                      textSize="text-xs"
                      backGroundColor="bg-green-600"
                    />
                  ))}
                </View>
              </View>
            )}
            {/* MAPS */}
            {property?.location?.coordinates && (
              <PropertyMapView
                coordinates={property.location.coordinates}
                boundaries={property.location.boundaries}
                address={`${property.location.address}, ${property.location.barangay}, ${property.location.city}`}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Inquire Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3.5 shadow-md shadow-blue-200 flex-row justify-center items-center gap-2 hover:bg-blue-700 transition-colors"
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="email-fast" size={20} color="white" />
          <Text className="text-base font-bold text-white text-center tracking-wide">Inquire Now</Text>
        </TouchableOpacity>
      </View>

      {/* ── Lightbox Modal ──────────────────────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={lightboxVisible}
        onRequestClose={() => setLightboxVisible(false)}
      >
        <View
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.93)", justifyContent: "center", alignItems: "center" }}
        >
          {/* Close */}
          <TouchableOpacity
            onPress={() => setLightboxVisible(false)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              zIndex: 10,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 100,
              padding: 8,
            }}
          >
            <MaterialCommunityIcons name="close" size={26} color="white" />
          </TouchableOpacity>

          {/* Counter */}
          <View style={{ position: "absolute", top: 24, left: 0, right: 0, alignItems: "center", zIndex: 10 }}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }}>
              {lightboxIndex + 1} / {mediaCount}
            </Text>
          </View>

          {/* Full-size image */}
          <Image
            source={{ uri: property?.media?.[lightboxIndex]?.url }}
            style={{ width: "100%", height: "80%", maxWidth: 900 } as any}
            resizeMode="contain"
          />

          {/* Prev / Next arrows */}
          {mediaCount > 1 && (
            <>
              <TouchableOpacity
                onPress={lightboxPrev}
                style={{
                  position: "absolute",
                  left: 16,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 100,
                  padding: 12,
                }}
              >
                <MaterialCommunityIcons name="chevron-left" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={lightboxNext}
                style={{
                  position: "absolute",
                  right: 16,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: 100,
                  padding: 12,
                }}
              >
                <MaterialCommunityIcons name="chevron-right" size={30} color="white" />
              </TouchableOpacity>
            </>
          )}

          {/* Dot indicators */}
          <View style={{ flexDirection: "row", gap: 8, position: "absolute", bottom: 30 }}>
            {property?.media?.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setLightboxIndex(i)}>
                <View
                  style={{
                    width: i === lightboxIndex ? 16 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === lightboxIndex ? "white" : "rgba(255,255,255,0.4)",
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ── Inquiry Modal ───────────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[32px] p-6 shadow-xl w-full max-w-5xl mx-auto relative">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-extrabold text-gray-800">Contact Agent</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-gray-100 p-2 rounded-full">
                <MaterialCommunityIcons name="close" size={20} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <View className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
              <Text className="text-sm font-bold text-blue-800 mb-1">Clark Adam Arconado</Text>
              <Text className="text-xs text-blue-600 mb-1">Email: clarkadamarconado@gmail.com</Text>
              <Text className="text-xs text-blue-600">Mobile: 09261849580</Text>
            </View>

            <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
              Send a message via
            </Text>

            <View className="gap-3 mb-6">
              {Platform.OS !== "web" && (
                <TouchableOpacity
                  onPress={openMobile}
                  className="flex-row items-center bg-gray-50 p-4 rounded-xl border border-gray-200"
                  activeOpacity={0.7}
                >
                  <View className="bg-green-100 p-2.5 rounded-full mr-4">
                    <MaterialCommunityIcons name="message-text" size={22} color="#16a34a" />
                  </View>
                  <Text className="text-base font-semibold text-gray-800">SMS / Messaging App</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={openGmail}
                className="flex-row items-center bg-gray-50 p-4 rounded-xl border border-gray-200"
                activeOpacity={0.7}
              >
                <View className="bg-red-100 p-2.5 rounded-full mr-4">
                  <MaterialCommunityIcons name="gmail" size={22} color="#ea4335" />
                </View>
                <Text className="text-base font-semibold text-gray-800">Gmail</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openFB}
                className="flex-row items-center bg-gray-50 p-4 rounded-xl border border-gray-200"
                activeOpacity={0.7}
              >
                <View className="bg-blue-100 p-2.5 rounded-full mr-4">
                  <MaterialCommunityIcons name="facebook" size={22} color="#1877f2" />
                </View>
                <Text className="text-base font-semibold text-gray-800">Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openInstagram}
                className="flex-row items-center bg-gray-50 p-4 rounded-xl border border-gray-200"
                activeOpacity={0.7}
              >
                <View className="bg-pink-100 p-2.5 rounded-full mr-4">
                  <MaterialCommunityIcons name="instagram" size={22} color="#e1306c" />
                </View>
                <Text className="text-base font-semibold text-gray-800">Instagram</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
