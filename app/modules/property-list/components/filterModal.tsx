import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Modal, Pressable, ScrollView, Platform,
  useWindowDimensions, StyleSheet, TextInput, LayoutChangeEvent,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { getPropertyBounds } from '@/app/service/property-service';
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from '@/app/lib/property-type';
import { PROVINCES, getBarangaysForCity, getCitiesForProvince } from '@/app/constants/locations';

export interface FilterState {
  type: string[];
  status: string[];
  features: string[];
  amenities: string[];
  minPrice: number;
  maxPrice: number;
  province: string;
  city: string;
  barangay: string;
  minArea: number;
  maxArea: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const FILTER_FEATURES: { key: string; name: string; icon: string }[] = [
  { key: 'road',        name: 'Main Road',      icon: 'road-variant' },
  { key: 'hospital',    name: 'Hospital',        icon: 'hospital-building' },
  { key: 'school',      name: 'School',          icon: 'school' },
  { key: 'store',       name: 'Market',          icon: 'store' },
  { key: 'beach',       name: 'Beach Spot',      icon: 'beach' },
  { key: 'shopping',    name: 'Mall Nearby',     icon: 'shopping' },
  { key: 'parking',     name: 'Parking',         icon: 'parking' },
  { key: 'church',      name: 'Church/Chapel',   icon: 'church' },
  { key: 'transport',   name: 'Transport Hub',   icon: 'bus-stop' },
  { key: 'nature',      name: 'Nature/Park',     icon: 'nature-people' },
  { key: 'restaurant',  name: 'Restaurant',      icon: 'food-fork-drink' },
  { key: 'gas_station', name: 'Gas Station',     icon: 'gas-station' },
  { key: 'gated',       name: 'Gated Community', icon: 'gate' },
  { key: 'wifi',        name: 'Fiber/Internet',  icon: 'wifi' },
  { key: 'mountain',    name: 'Mountain View',   icon: 'image-filter-hdr' },
];

const FILTER_AMENITIES: { key: string; name: string; icon: string }[] = [
  { key: 'pool',            name: 'Swimming Pool',   icon: 'pool' },
  { key: 'gym',             name: 'Gym',             icon: 'dumbbell' },
  { key: 'security',        name: '24/7 Security',   icon: 'shield-check' },
  { key: 'elevator',        name: 'Elevator',        icon: 'elevator' },
  { key: 'cctv',            name: 'CCTV',            icon: 'cctv' },
  { key: 'water',           name: 'Water System',    icon: 'water-pump' },
  { key: 'solar',           name: 'Solar Power',     icon: 'solar-panel' },
  { key: 'garden',          name: 'Garden/Yard',     icon: 'tree' },
  { key: 'balcony',         name: 'Balcony',         icon: 'balcony' },
  { key: 'covered_parking', name: 'Covered Parking', icon: 'garage' },
];

// ─── Dual-handle Range Slider ────────────────────────────────────────────────
const THUMB = 26;

interface RangeSliderProps {
  min: number; max: number; step: number;
  low: number; high: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
}

function RangeSlider({ min, max, step, low, high, onLowChange, onHighChange }: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  // Always-fresh refs — accessible inside responder closures without stale closure issues
  const twRef   = useRef(0);   // trackWidth
  const lowRef  = useRef(low);
  const highRef = useRef(high);
  useEffect(() => { lowRef.current  = low;  }, [low]);
  useEffect(() => { highRef.current = high; }, [high]);

  const snap  = (v: number) => Math.round(v / step) * step;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  const pxFromVal = (v: number) =>
    twRef.current === 0 ? 0 : ((v - min) / (max - min)) * twRef.current;

  const valFromOffset = (offsetPx: number) =>
    snap(clamp(min + (offsetPx / twRef.current) * (max - min), min, max));

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    twRef.current = w;
    setTrackWidth(w);
  };

  // Per-thumb drag state
  const startPageXRef = useRef(0);
  const startValRef   = useRef(0);

  const makeThumHandlers = (thumb: 'low' | 'high') => ({
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder:  () => true,
    onResponderGrant: (e: any) => {
      startPageXRef.current = e.nativeEvent.pageX;
      startValRef.current   = thumb === 'low' ? lowRef.current : highRef.current;
    },
    onResponderMove: (e: any) => {
      if (!twRef.current) return;
      const dx      = e.nativeEvent.pageX - startPageXRef.current;
      const startPx = pxFromVal(startValRef.current);
      const newVal  = valFromOffset(startPx + dx);
      if (thumb === 'low') {
        onLowChange(clamp(newVal, min, highRef.current - step));
      } else {
        onHighChange(clamp(newVal, lowRef.current + step, max));
      }
    },
    onResponderRelease:   () => {},
    onResponderTerminate: () => {},
  });

  const lowHandlers  = makeThumHandlers('low');
  const highHandlers = makeThumHandlers('high');

  const lowPx  = pxFromVal(low);
  const highPx = pxFromVal(high);
  const TRACK_H = 6;
  const CONTAINER_H = THUMB + 12;
  const trackTop = (CONTAINER_H - TRACK_H) / 2;
  const thumbTop = (CONTAINER_H - THUMB) / 2;

  return (
    <View style={{ paddingHorizontal: THUMB / 2 }}>
      <View
        onLayout={onLayout}
        style={{ height: CONTAINER_H, position: 'relative' }}
      >
        {/* Track background */}
        <View style={{
          position: 'absolute', left: 0, right: 0,
          top: trackTop, height: TRACK_H,
          backgroundColor: '#e5e7eb', borderRadius: 3,
        }} />

        {/* Active fill */}
        {trackWidth > 0 && (
          <View style={{
            position: 'absolute',
            left: lowPx, width: Math.max(0, highPx - lowPx),
            top: trackTop, height: TRACK_H,
            backgroundColor: '#2563eb', borderRadius: 3,
          }} />
        )}

        {/* Low thumb */}
        {trackWidth > 0 && (
          <View
            {...lowHandlers}
            style={[sl.thumb, { position: 'absolute', left: lowPx - THUMB / 2, top: thumbTop }]}
          >
            <View style={sl.inner} />
          </View>
        )}

        {/* High thumb */}
        {trackWidth > 0 && (
          <View
            {...highHandlers}
            style={[sl.thumb, { position: 'absolute', left: highPx - THUMB / 2, top: thumbTop }]}
          >
            <View style={sl.inner} />
          </View>
        )}
      </View>
    </View>
  );
}

const sl = StyleSheet.create({
  thumb: {
    width: THUMB, height: THUMB, borderRadius: THUMB / 2,
    backgroundColor: '#fff', borderWidth: 2.5, borderColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 5,
    cursor: 'grab' as any,
    userSelect: 'none' as any,
  },
  inner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563eb' },
});

// ─── Numeric Input ────────────────────────────────────────────────────────────
interface NumInputProps {
  label: string; value: number;
  min: number; max: number;
  formatDisplay: (v: number) => string;
  parseInput: (s: string) => number;
  onChange: (v: number) => void;
}

function NumInput({ label, value, min, max, formatDisplay, parseInput, onChange }: NumInputProps) {
  const [editing, setEditing] = useState(false);
  const [raw, setRaw] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: '500' }}>{label}</Text>
      <TextInput
        style={{
          borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
          paddingHorizontal: 10, paddingVertical: Platform.OS === 'web' ? 6 : 10,
          fontSize: 14, color: '#111827', backgroundColor: '#f9fafb',
          fontWeight: '600', textAlign: 'center',
        }}
        value={editing ? raw : formatDisplay(value)}
        onFocus={() => { setEditing(true); setRaw(String(value)); }}
        onBlur={() => {
          setEditing(false);
          const n = parseInput(raw);
          if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
        }}
        onChangeText={setRaw}
        keyboardType="numeric"
        selectTextOnFocus
      />
    </View>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────
export function FilterModal({ visible, onClose, filters, setFilters }: FilterModalProps) {
  const { width, height } = useWindowDimensions();
  const isWebDesktop = width >= 1024 && Platform.OS === 'web';
  const [localFilters, setLocalFilters] = useState<FilterState>({ features: [], amenities: [], ...filters });
  const [bounds, setBounds] = useState({ maxPrice: 100_000_000, maxLotArea: 5000 });

  useEffect(() => {
    if (!visible) return;
    setLocalFilters({ features: [], amenities: [], ...filters });
    getPropertyBounds().then((res) => {
      if (!res.ok) return;
      const b = res.data;
      setBounds(b);
      setLocalFilters((prev) => ({
        ...prev,
        maxPrice: prev.maxPrice === 0 && prev.minPrice === 0 ? b.maxPrice : (prev.maxPrice || b.maxPrice),
        maxArea:  prev.maxArea  === 0 && prev.minArea  === 0 ? b.maxLotArea : (prev.maxArea  || b.maxLotArea),
      }));
    });
  }, [visible, filters]);

  const toggle = (key: 'type' | 'status' | 'features' | 'amenities', value: string) =>
    setLocalFilters((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value] };
    });

  const clearFilters = () =>
    setLocalFilters({ type: [], status: [], features: [], amenities: [], minPrice: 0, maxPrice: bounds.maxPrice, province: '', city: '', barangay: '', minArea: 0, maxArea: bounds.maxLotArea });

  const handleApply = () => { setFilters(localFilters); onClose(); };

  const fmt = (v: number) => {
    if (v >= 1_000_000) return `₱${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000)     return `₱${(v / 1_000).toFixed(0)}k`;
    return `₱${v}`;
  };
  const parseMoney = (s: string) => {
    const c = s.replace(/[₱,\s]/g, '').toLowerCase();
    if (c.endsWith('m')) return parseFloat(c) * 1_000_000;
    if (c.endsWith('k')) return parseFloat(c) * 1_000;
    return parseFloat(c);
  };

  const propertyTypes = [...PROPERTY_TYPES];
  const statusOptions = ['AVAILABLE', 'SOLD', 'RESERVED'];
  const cityOptions = localFilters.province ? getCitiesForProvince(localFilters.province) : [];
  const barangayOptions = localFilters.province && localFilters.city
    ? getBarangaysForCity(localFilters.province, localFilters.city)
    : [];

  const modalContent = (
    <View style={[
      { backgroundColor: 'white' },
      isWebDesktop
        ? { borderRadius: 24, width: '100%', maxWidth: 512, alignSelf: 'center', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, maxHeight: height * 0.82 }
        : { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.85 },
    ]}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Filters</Text>
        <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full">
          <Feather name="x" size={24} color="#374151" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>

        {/* Province, City & Barangay */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">Province</Text>
          <Dropdown
            style={{
              height: 50,
              backgroundColor: '#ffffff',
              borderColor: '#d1d5db',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 16,
              marginBottom: 16,
            }}
            placeholderStyle={{ color: '#6b7280', fontSize: 15 }}
            selectedTextStyle={{ color: '#374151', fontSize: 15 }}
            iconStyle={{ width: 22, height: 22, tintColor: '#6b7280' }}
            data={[
              { label: 'All Provinces', value: '' },
              ...PROVINCES.map((p) => ({ label: p, value: p })),
            ]}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="All Provinces"
            value={localFilters.province}
            onChange={(item) => {
              setLocalFilters({ ...localFilters, province: item.value, city: '', barangay: '' });
            }}
            containerStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}
            itemTextStyle={{ color: '#374151' }}
            activeColor={'#f3f4f6'}
          />

          <View className="flex-row" style={{ gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text className="text-base font-semibold text-gray-700 mb-3">City / Municipality</Text>
            <Dropdown
              style={{
                  height: 50,
                  backgroundColor: !localFilters.province ? '#f3f4f6' : '#ffffff',
                  borderColor: '#d1d5db',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  opacity: !localFilters.province ? 0.7 : 1,
              }}
              placeholderStyle={{ color: '#6b7280', fontSize: 15 }}
              selectedTextStyle={{ color: '#374151', fontSize: 15 }}
              inputSearchStyle={{
                  height: 44,
                  fontSize: 15,
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                  borderColor: '#e5e7eb',
                  borderRadius: 8
              }}
              iconStyle={{ width: 22, height: 22, tintColor: '#6b7280' }}
              data={[
                { label: 'All Cities', value: '' },
                ...cityOptions.map(c => ({ label: c, value: c }))
              ]}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={localFilters.province ? 'All Cities' : 'Select Province First'}
              searchPlaceholder="Search city..."
              value={localFilters.city}
              onChange={item => {
                  setLocalFilters({ ...localFilters, city: item.value, barangay: '' });
              }}
              disable={!localFilters.province}
              containerStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}
              itemTextStyle={{ color: '#374151' }}
              activeColor={'#f3f4f6'}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text className="text-base font-semibold text-gray-700 mb-3">Barangay</Text>
            <Dropdown
              style={{
                  height: 50,
                  backgroundColor: !localFilters.city ? '#f3f4f6' : '#ffffff',
                  borderColor: '#d1d5db',
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  opacity: !localFilters.city ? 0.7 : 1
              }}
              placeholderStyle={{ color: '#6b7280', fontSize: 15 }}
              selectedTextStyle={{ color: '#374151', fontSize: 15 }}
              inputSearchStyle={{
                  height: 44,
                  fontSize: 15,
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                  borderColor: '#e5e7eb',
                  borderRadius: 8
              }}
              iconStyle={{ width: 22, height: 22, tintColor: '#6b7280' }}
              data={localFilters.city ? [
                { label: 'All Barangays', value: '' },
                ...barangayOptions.map(b => ({ label: b, value: b }))
              ] : []}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={localFilters.city ? "All Barangays" : "Select City First"}
              searchPlaceholder="Search barangay..."
              value={localFilters.barangay}
              onChange={item => {
                  setLocalFilters({ ...localFilters, barangay: item.value });
              }}
              disable={!localFilters.city}
              containerStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' }}
              itemTextStyle={{ color: '#374151' }}
              activeColor={'#f3f4f6'}
            />
          </View>
          </View>
        </View>

        {/* Nearby Features */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-base font-semibold text-gray-700 flex-1">Nearby Features</Text>
            {localFilters.features.length > 0 && (
              <Pressable onPress={() => setLocalFilters((p) => ({ ...p, features: [] }))}>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500' }}>Clear</Text>
              </Pressable>
            )}
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {FILTER_FEATURES.map((f) => {
              const active = localFilters.features.includes(f.key);
              return (
                <Pressable
                  key={f.key}
                  onPress={() => toggle('features', f.key)}
                  style={[
                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
                    active
                      ? { backgroundColor: '#2563eb', borderColor: '#2563eb' }
                      : { backgroundColor: '#fff', borderColor: '#d1d5db' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={f.icon as any}
                    size={13}
                    color={active ? '#fff' : '#6b7280'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? '#fff' : '#374151' }}>
                    {f.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Amenities */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <Text className="text-base font-semibold text-gray-700 flex-1">Amenities</Text>
            {localFilters.amenities.length > 0 && (
              <Pressable onPress={() => setLocalFilters((p) => ({ ...p, amenities: [] }))}>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: '500' }}>Clear</Text>
              </Pressable>
            )}
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {FILTER_AMENITIES.map((a) => {
              const active = localFilters.amenities.includes(a.key);
              return (
                <Pressable
                  key={a.key}
                  onPress={() => toggle('amenities', a.key)}
                  style={[
                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
                    active
                      ? { backgroundColor: '#2563eb', borderColor: '#2563eb' }
                      : { backgroundColor: '#fff', borderColor: '#d1d5db' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={a.icon as any}
                    size={13}
                    color={active ? '#fff' : '#6b7280'}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? '#fff' : '#374151' }}>
                    {a.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Property Type */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">Property Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {propertyTypes.map((t) => (
              <Pressable key={t} onPress={() => toggle('type', t)}
                className={`px-4 py-2 rounded-full border ${localFilters.type.includes(t) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                <Text className={localFilters.type.includes(t) ? 'text-white font-medium' : 'text-gray-600'}>{PROPERTY_TYPE_LABELS[t]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Status */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {statusOptions.map((s) => (
              <Pressable key={s} onPress={() => toggle('status', s)}
                className={`px-4 py-2 rounded-full border ${localFilters.status.includes(s) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                <Text className={localFilters.status.includes(s) ? 'text-white font-medium' : 'text-gray-600'}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-700">Price Range</Text>
            <Text className="text-sm font-semibold text-blue-600">{fmt(localFilters.minPrice)} – {fmt(localFilters.maxPrice)}</Text>
          </View>
          <RangeSlider
            min={0} max={bounds.maxPrice} step={100_000}
            low={localFilters.minPrice} high={localFilters.maxPrice}
            onLowChange={(v) => setLocalFilters((p) => ({ ...p, minPrice: v, maxPrice: v > p.maxPrice ? v : p.maxPrice }))}
            onHighChange={(v) => setLocalFilters((p) => ({ ...p, maxPrice: v, minPrice: v < p.minPrice ? v : p.minPrice }))}
          />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <NumInput label="Min Price" value={localFilters.minPrice} min={0} max={localFilters.maxPrice}
              formatDisplay={fmt} parseInput={parseMoney}
              onChange={(v) => setLocalFilters((p) => ({ ...p, minPrice: Math.min(v, p.maxPrice) }))} />
            <NumInput label="Max Price" value={localFilters.maxPrice} min={localFilters.minPrice} max={bounds.maxPrice}
              formatDisplay={fmt} parseInput={parseMoney}
              onChange={(v) => setLocalFilters((p) => ({ ...p, maxPrice: Math.max(v, p.minPrice) }))} />
          </View>
        </View>

        {/* Lot Area Range */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-700">Lot Area Range</Text>
            <Text className="text-sm font-semibold text-blue-600">{localFilters.minArea} – {localFilters.maxArea} sqm</Text>
          </View>
          <RangeSlider
            min={0} max={bounds.maxLotArea} step={10}
            low={localFilters.minArea} high={localFilters.maxArea}
            onLowChange={(v) => setLocalFilters((p) => ({ ...p, minArea: v, maxArea: v > p.maxArea ? v : p.maxArea }))}
            onHighChange={(v) => setLocalFilters((p) => ({ ...p, maxArea: v, minArea: v < p.minArea ? v : p.minArea }))}
          />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <NumInput label="Min Area (sqm)" value={localFilters.minArea} min={0} max={localFilters.maxArea}
              formatDisplay={(v) => `${v}`} parseInput={(s) => parseFloat(s.replace(/[^\d.]/g, ''))}
              onChange={(v) => setLocalFilters((p) => ({ ...p, minArea: Math.min(v, p.maxArea) }))} />
            <NumInput label="Max Area (sqm)" value={localFilters.maxArea} min={localFilters.minArea} max={bounds.maxLotArea}
              formatDisplay={(v) => `${v}`} parseInput={(s) => parseFloat(s.replace(/[^\d.]/g, ''))}
              onChange={(v) => setLocalFilters((p) => ({ ...p, maxArea: Math.max(v, p.minArea) }))} />
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View className="p-6 border-t border-gray-200 bg-white flex-row gap-4">
        <Pressable onPress={clearFilters} className="flex-1 py-4 border border-gray-300 rounded-xl items-center justify-center">
          <Text className="text-gray-700 font-semibold text-base">Reset</Text>
        </Pressable>
        <Pressable onPress={handleApply} className="flex-1 py-4 bg-blue-600 rounded-xl items-center justify-center">
          <Text className="text-white font-semibold text-base">Apply Filters</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType={isWebDesktop ? 'fade' : 'slide'} transparent onRequestClose={onClose}>
      <View className={`flex-1 ${isWebDesktop ? 'justify-center items-center p-4' : 'justify-end'}`}>
        <Pressable style={StyleSheet.absoluteFillObject} className="bg-black/50" onPress={onClose} />
        <Pressable className={isWebDesktop ? 'w-full max-w-lg' : 'w-full'} onPress={(e) => e.stopPropagation()}>
          {modalContent}
        </Pressable>
      </View>
    </Modal>
  );
}

export default function FilterModalRouteStub(): null { return null; }
