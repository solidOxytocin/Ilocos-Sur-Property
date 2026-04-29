import React, { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { getPropertyBounds } from '@/app/service/property-service';

export interface FilterState {
  type: string[];
  status: string[];
  minPrice: number;
  maxPrice: number;
  city: string;
  minArea: number;
  maxArea: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const ilocosSurCities = [
    "Alilem", "Banayoyo", "Bantay", "Burgos", "Cabugao", "Candon City", 
    "Caoayan", "Cervantes", "Galimuyod", "Gregorio del Pilar", "Lidlidda", 
    "Magsingal", "Nagbukel", "Narvacan", "Quirino", "Salcedo", "San Emilio", 
    "San Esteban", "San Ildefonso", "San Juan", "San Vicente", "Santa", 
    "Santa Catalina", "Santa Cruz", "Santa Lucia", "Santa Maria", "Santiago", 
    "Santo Domingo", "Sigay", "Sinait", "Sugpon", "Suyo", "Tagudin", "Vigan City"
  ].sort();

export function FilterModal({ visible, onClose, filters, setFilters }: FilterModalProps) {
  const { width, height } = useWindowDimensions();
  const isWebDesktop = width >= 1024 && Platform.OS === 'web';
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [bounds, setBounds] = useState({ maxPrice: 100000000, maxLotArea: 5000 });

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      getPropertyBounds().then(b => {
          setBounds(b);
          setLocalFilters(prev => ({
              ...prev,
              maxPrice: prev.maxPrice === 0 && prev.minPrice === 0 ? b.maxPrice : (prev.maxPrice || b.maxPrice),
              maxArea: prev.maxArea === 0 && prev.minArea === 0 ? b.maxLotArea : (prev.maxArea || b.maxLotArea),
          }));
      });
    }
  }, [visible, filters]);

  const toggleArrayItem = (key: 'type' | 'status', value: string) => {
    setLocalFilters(prev => {
        const arr = prev[key];
        if (arr.includes(value)) {
            return { ...prev, [key]: arr.filter(i => i !== value) };
        } else {
            return { ...prev, [key]: [...arr, value] };
        }
    });
  };

  const clearFilters = () => {
    setLocalFilters({
      type: [],
      status: [],
      minPrice: 0,
      maxPrice: bounds.maxPrice,
      city: '',
      minArea: 0,
      maxArea: bounds.maxLotArea,
    });
  };

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const propertyTypes = ['LOT', 'HOUSE', 'CONDO', 'COMMERCIAL'];
  const statusOptions = ['AVAILABLE', 'SOLD', 'RESERVED'];

  const formatMoney = (val: number) => {
      if (val >= 1000000) return `₱${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `₱${(val / 1000).toFixed(0)}k`;
      return `₱${val}`;
  }

  const screenHeight = height;
  const mobileMaxHeight = screenHeight * 0.85;

  const modalContent = (
    <View
      style={[
        { backgroundColor: 'white' },
        isWebDesktop
          ? { borderRadius: 24, width: '100%', maxWidth: 512, alignSelf: 'center', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, maxHeight: height * 0.82 }
          : { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: mobileMaxHeight },
      ]}
    >
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Filters</Text>
        <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full">
          <Feather name="x" size={24} color="#374151" />
        </Pressable>
      </View>

      <ScrollView style={{ flexGrow: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* City Filter via Dropdown */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">City / Municipality</Text>
          <View style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden', backgroundColor: 'white', height: Platform.OS === 'web' ? 44 : 56 }}>
            <Picker
              selectedValue={localFilters.city}
              onValueChange={(itemValue) => setLocalFilters({ ...localFilters, city: itemValue })}
              style={{ backgroundColor: 'transparent', height: Platform.OS === 'web' ? 44 : 56, paddingHorizontal: Platform.OS === 'web' ? 12 : 0 }}
            >
              <Picker.Item label="All City" value="" />
              {ilocosSurCities.map((city) => (
                <Picker.Item key={city} label={city} value={city} />
              ))}
            </Picker>
          </View>
        </View>



        {/* Property Type */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">Property Type</Text>
          <View className="flex-row flex-wrap gap-2">
            {propertyTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => toggleArrayItem('type', type)}
                className={`px-4 py-2 rounded-full border ${localFilters.type.includes(type) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
              >
                <Text className={localFilters.type.includes(type) ? 'text-white font-medium' : 'text-gray-600'}>{type}</Text>
              </Pressable>
            ))}
          </View>
        </View>

         {/* Property Status */}
         <View className="mb-6">
          <Text className="text-base font-semibold text-gray-700 mb-3">Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Pressable
                key={status}
                onPress={() => toggleArrayItem('status', status)}
                className={`px-4 py-2 rounded-full border ${localFilters.status.includes(status) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
              >
                <Text className={localFilters.status.includes(status) ? 'text-white font-medium' : 'text-gray-600'}>{status}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Price Range via Sliders */}
        <View className="mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-base font-semibold text-gray-700">Price Range</Text>
            <Text className="font-semibold text-blue-600">
                {formatMoney(localFilters.minPrice)} - {formatMoney(localFilters.maxPrice)}
            </Text>
          </View>
          <View className="mb-4">
             <Text className="text-sm text-gray-500 mb-1">Min Price: {formatMoney(localFilters.minPrice)}</Text>
             <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={bounds.maxPrice}
                step={100000}
                value={localFilters.minPrice}
                onValueChange={(val) => {
                    setLocalFilters(prev => ({
                        ...prev, 
                        minPrice: val, 
                        maxPrice: val > prev.maxPrice ? val : prev.maxPrice
                    }))
                }}
                minimumTrackTintColor="#2563eb"
                maximumTrackTintColor="#d1d5db"
              />
          </View>
          <View>
             <Text className="text-sm text-gray-500 mb-1">Max Price: {formatMoney(localFilters.maxPrice)}</Text>
             <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={bounds.maxPrice}
                step={100000}
                value={localFilters.maxPrice}
                onValueChange={(val) => {
                    setLocalFilters(prev => ({
                        ...prev, 
                        maxPrice: val, 
                        minPrice: val < prev.minPrice ? val : prev.minPrice
                    }))
                }}
                minimumTrackTintColor="#2563eb"
                maximumTrackTintColor="#d1d5db"
              />
          </View>
        </View>

        {/* Area Range via Sliders */}
         <View className="mb-10">
          <View className="flex-row justify-between mb-2">
            <Text className="text-base font-semibold text-gray-700">Lot Area Range</Text>
            <Text className="font-semibold text-blue-600">
                {localFilters.minArea} sqm - {localFilters.maxArea} sqm
            </Text>
          </View>
          <View className="mb-4">
             <Text className="text-sm text-gray-500 mb-1">Min Area: {localFilters.minArea} sqm</Text>
             <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={bounds.maxLotArea}
                step={10}
                value={localFilters.minArea}
                onValueChange={(val) => {
                    setLocalFilters(prev => ({
                        ...prev, 
                        minArea: val, 
                        maxArea: val > prev.maxArea ? val : prev.maxArea
                    }))
                }}
                minimumTrackTintColor="#2563eb"
                maximumTrackTintColor="#d1d5db"
              />
          </View>
          <View>
             <Text className="text-sm text-gray-500 mb-1">Max Area: {localFilters.maxArea} sqm</Text>
             <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={bounds.maxLotArea}
                step={10}
                value={localFilters.maxArea}
                onValueChange={(val) => {
                    setLocalFilters(prev => ({
                        ...prev, 
                        maxArea: val, 
                        minArea: val < prev.minArea ? val : prev.minArea
                    }))
                }}
                minimumTrackTintColor="#2563eb"
                maximumTrackTintColor="#d1d5db"
              />
          </View>
        </View>

      </ScrollView>

      {/* Footer Actions */}
      <View className="p-6 border-t border-gray-200 bg-white flex-row gap-4">
        <Pressable onPress={clearFilters} className="flex-1 py-4 border border-gray-300 rounded-xl items-center justify-center">
          <Text className="text-gray-700 font-semibold text-base">Reset</Text>
        </Pressable>
        <Pressable onPress={handleApply} className="flex-1 py-4 bg-blue-600 rounded-xl items-center justify-center shadow-sm">
          <Text className="text-white font-semibold text-base">Apply Filters</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType={isWebDesktop ? 'fade' : 'slide'}
      transparent={true}
      onRequestClose={onClose}
    >
      <View 
        className={`flex-1 ${isWebDesktop ? 'justify-center items-center p-4' : 'justify-end'}`}
      >
        {/* Background Overlay */}
        <Pressable 
          style={StyleSheet.absoluteFillObject}
          className="bg-black/50" 
          onPress={onClose} 
        />
        
        {/* Modal Content container to prevent clicks on content from closing the modal */}
        <Pressable className={isWebDesktop ? 'w-full max-w-lg' : 'w-full'} onPress={(e) => e.stopPropagation()}>
          {modalContent}
        </Pressable>
      </View>
    </Modal>
  );
}
