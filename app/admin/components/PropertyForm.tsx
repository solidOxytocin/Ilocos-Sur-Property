import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { createProperty, updateProperty, uploadPropertyImages } from '../../service/admin-service';
import { Property, Media } from '../../constants/mock/mock-properties';
import AdminMapPicker from './AdminMapPicker';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type PhotoSlot =
  | { id: string; kind: 'url'; media: Partial<Media> }
  | { id: string; kind: 'staged'; asset: ImagePicker.ImagePickerAsset };

function slotsFromInitialMedia(media: Media[] | undefined): PhotoSlot[] {
  if (!media?.length) return [];
  const ordered = [...media].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return 0;
  });
  return ordered.map((m, i) => ({
    id: `init-${m.id ?? i}-${String(m.url).slice(-12)}`,
    kind: 'url' as const,
    media: {
      url: m.url,
      type: m.type ?? 'image',
      cloudinaryPublicId: m.cloudinaryPublicId ?? undefined,
      id: m.id,
    },
  }));
}

interface PropertyFormProps {
  initialData?: Property;
  isEdit?: boolean;
}

export default function PropertyForm({ initialData, isEdit = false }: PropertyFormProps) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  // Basic Info
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState((initialData?.type || 'HOUSE').toUpperCase());
  const [status, setStatus] = useState((initialData?.status || 'AVAILABLE').toUpperCase());
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [details, setDetails] = useState(initialData?.details || '');

  // Dimensions
  const [lotArea, setLotArea] = useState(initialData?.lotArea?.toString() || '');
  const [floorArea, setFloorArea] = useState(initialData?.floorArea?.toString() || '');
  const [bedRooms, setBedRooms] = useState(initialData?.bedRooms?.toString() || initialData?.bedrooms?.toString() || '');
  const [bathRooms, setBathRooms] = useState(initialData?.bathRooms?.toString() || initialData?.bathrooms?.toString() || '');
  const [parking, setParking] = useState(initialData?.parking?.toString() || '');

  // Location
  const [address, setAddress] = useState(initialData?.location?.address || '');
  const [barangay, setBarangay] = useState(initialData?.location?.barangay || '');
  const [city, setCity] = useState(initialData?.location?.city || '');
  const [province, setProvince] = useState(initialData?.location?.province || '');
  
  // Maps & Boundaries
  const [latitude, setLatitude] = useState(initialData?.location?.coordinates?.lat?.toString() || '');
  const [longitude, setLongitude] = useState(initialData?.location?.coordinates?.lng?.toString() || '');
  const [boundariesRaw, setBoundariesRaw] = useState(initialData?.location?.boundaries ? JSON.stringify(initialData.location.boundaries, null, 2) : '');
  
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(() => slotsFromInitialMedia(initialData?.media));
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());

  const galleryCols = windowWidth >= 960 ? 4 : windowWidth >= 640 ? 3 : 2;
  const galleryGap = 12;
  const contentInner = Math.max(260, Math.min(windowWidth - 64, 820));
  const rawTile = Math.floor((contentInner - galleryGap * (galleryCols - 1)) / galleryCols);
  const tileSize = Math.max(104, Math.min(200, rawTile));

  // Features & Amenities
  const AVAILABLE_FEATURES = [
      { key: "road", name: "Main Road" },
      { key: "hospital", name: "Hospital" },
      { key: "school", name: "School" },
      { key: "store", name: "Market" },
      { key: "beach", name: "Beach Spot" },
      { key: "shopping", name: "Mall Nearby" },
      { key: "parking", name: "Parking" },
  ];
  
  const AVAILABLE_AMENITIES = [
      { key: "pool", name: "Swimming Pool" },
      { key: "gym", name: "Gym" },
      { key: "security", name: "24/7 Security" },
      { key: "elevator", name: "Elevator" },
  ];

  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set((initialData?.features || (initialData as any)?.feature || []).map((f: any) => f.key)));
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set((initialData?.amenities || (initialData as any)?.amenity || []).map((a: any) => a.key)));

  const toggleFeature = (key: string) => {
      const next = new Set(selectedFeatures);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setSelectedFeatures(next);
  };

  const toggleAmenity = (key: string) => {
      const next = new Set(selectedAmenities);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setSelectedAmenities(next);
  };

  const genPhotoId = useCallback(() => `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, []);

  const removePhotoById = (id: string) => {
    setPhotoSlots((prev) => prev.filter((s) => s.id !== id));
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const togglePhotoSelected = (id: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllPhotos = () => {
    if (selectedPhotoIds.size === photoSlots.length) {
      setSelectedPhotoIds(new Set());
    } else {
      setSelectedPhotoIds(new Set(photoSlots.map((s) => s.id)));
    }
  };

  const deleteSelectedPhotos = () => {
    if (selectedPhotoIds.size === 0) return;
    const n = selectedPhotoIds.size;
    const ids = new Set(selectedPhotoIds);
    const run = () => {
      setPhotoSlots((prev) => prev.filter((s) => !ids.has(s.id)));
      setSelectedPhotoIds(new Set());
    };
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      if (window.confirm(`Remove ${n} photo${n === 1 ? '' : 's'} from this listing?`)) run();
    } else {
      Alert.alert('Remove photos', `Remove ${n} photo${n === 1 ? '' : 's'} from this listing?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: run },
      ]);
    }
  };

  const setAsPrimary = (id: string) => {
    setPhotoSlots((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      if (i <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(i, 1);
      next.unshift(item);
      return next;
    });
  };

  const pickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (result.canceled) return;
    const tooLarge = result.assets.find((a) => a.fileSize != null && a.fileSize > MAX_IMAGE_BYTES);
    if (tooLarge) {
      Alert.alert('File too large', 'Each image must be 10MB or smaller.');
      return;
    }
    setPhotoSlots((prev) => [
      ...prev,
      ...result.assets.map((asset) => ({ id: genPhotoId(), kind: 'staged' as const, asset })),
    ]);
  }, [genPhotoId]);

  const handleSave = async () => {
    if (!title || !price || !city || !province) {
        window.alert('Please fill out required fields: Title, Price, City, Province');
        return;
    }

    let parsedBoundaries = null;
    if (boundariesRaw.trim()) {
        try {
            parsedBoundaries = JSON.parse(boundariesRaw);
            if (!Array.isArray(parsedBoundaries)) throw new Error("Boundaries must be an array.");
        } catch (e) {
            window.alert('Invalid Boundaries JSON format. It must be a valid JSON array of {lat, lng} objects.');
            return;
        }
    }

    setLoading(true);

    const stagedInOrder = photoSlots.filter((s): s is Extract<PhotoSlot, { kind: 'staged' }> => s.kind === 'staged');
    let mediaSnapshot: Partial<Media>[] = [];

    if (stagedInOrder.length) {
      for (const s of stagedInOrder) {
        const a = s.asset;
        if (a.fileSize != null && a.fileSize > MAX_IMAGE_BYTES) {
          setLoading(false);
          Alert.alert('File too large', 'Each image must be 10MB or smaller.');
          return;
        }
      }
      const uploaded = await uploadPropertyImages(
        stagedInOrder.map((s) => ({
          uri: s.asset.uri,
          name: s.asset.fileName ?? undefined,
          mimeType: s.asset.mimeType ?? undefined,
        }))
      );
      if (uploaded === null || uploaded.length !== stagedInOrder.length) {
        setLoading(false);
        Alert.alert('Upload failed', 'Could not upload images. Check your API and Cloudinary configuration.');
        return;
      }
      let upIdx = 0;
      mediaSnapshot = photoSlots.map((slot) => {
        if (slot.kind === 'url') {
          return { ...slot.media, type: (slot.media.type ?? 'image') as 'image' | 'video' };
        }
        const u = uploaded[upIdx++];
        return {
          url: u.url,
          type: 'image' as const,
          cloudinaryPublicId: u.cloudinaryPublicId,
        };
      });
      const newSlots: PhotoSlot[] = mediaSnapshot
        .filter((m) => typeof m.url === 'string' && m.url.trim().length > 0)
        .map((m, i) => ({
          id: `saved-${i}-${String(m.url).slice(-10)}`,
          kind: 'url' as const,
          media: m,
        }));
      setPhotoSlots(newSlots);
      setSelectedPhotoIds(new Set());
    } else {
      mediaSnapshot = photoSlots
        .filter((s): s is Extract<PhotoSlot, { kind: 'url' }> => s.kind === 'url')
        .map((s) => ({ ...s.media, type: (s.media.type ?? 'image') as 'image' | 'video' }));
    }

    const dataToSave = {
        title,
        type,
        status,
        price: parseFloat(price),
        details,
        lotArea: lotArea ? parseFloat(lotArea) : null,
        floorArea: floorArea ? parseFloat(floorArea) : null,
        bedRooms: bedRooms ? parseInt(bedRooms) : null,
        bathRooms: bathRooms ? parseInt(bathRooms) : null,
        parking: parking ? parseInt(parking) : null,
        location: {
            address,
            barangay,
            city,
            province,
            country: 'Philippines',
            coordinates: (latitude && longitude) ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : undefined,
            boundaries: parsedBoundaries,
        },
        media: mediaSnapshot
            .filter((m) => typeof m.url === 'string' && m.url.trim().length > 0)
            .map((m, i) => ({
            url: m.url as string,
            isPrimary: i === 0,
            type: 'image',
            cloudinaryPublicId: m.cloudinaryPublicId ?? undefined,
        })),
        features: Array.from(selectedFeatures).map(key => ({ key })),
        amenities: Array.from(selectedAmenities).map(key => ({ key }))
    };

    let result;
    if (isEdit && initialData?.id) {
        result = await updateProperty(initialData.id, dataToSave as any);
    } else {
        result = await createProperty(dataToSave as any);
    }

    setLoading(false);

    if (result) {
        window.alert(isEdit ? 'Property updated successfully!' : 'Property created successfully!');
        router.back();
    } else {
        window.alert('Operation failed. Check logs.');
    }
  };

  // Reusable input component
  const InputField = ({ label, value, onChangeText, keyboardType = 'default', multiline = false, required = false }: any) => (
      <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-2">
            {label} {required && <Text className="text-red-500">*</Text>}
          </Text>
          <TextInput
              className={`bg-white border border-gray-200 rounded-lg p-3 text-gray-800 ${multiline ? 'h-32 text-left' : ''}`}
              value={value}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              multiline={multiline}
              style={multiline ? { textAlignVertical: 'top' } : {}}
              placeholder={`Enter ${label.toLowerCase()}`}
          />
      </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6 max-w-4xl mx-auto w-full">
        <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-800">
                {isEdit ? 'Edit Property' : 'Create New Property'}
            </Text>
            <View className="flex-row space-x-3">
                <TouchableOpacity 
                    className="px-4 py-3 rounded-lg flex-row items-center bg-gray-200"
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text className="text-gray-700 font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className={`px-6 py-3 rounded-lg flex-row items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : <MaterialIcons name="save" size={20} color="white" />}
                    <Text className="text-white font-bold ml-2">Save Property</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Basic Information</Text>
            <InputField label="Title" value={title} onChangeText={setTitle} required />
            <InputField label="Description/Details" value={details} onChangeText={setDetails} multiline />
            
            <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/3 px-2">
                    <InputField label="Price (PHP)" value={price} onChangeText={setPrice} keyboardType="numeric" required />
                </View>
                <View className="w-1/3 px-2 mb-4">
                     <Text className="text-gray-700 font-semibold mb-2">Type</Text>
                     <View className="flex-row border border-gray-200 rounded-lg overflow-hidden">
                        
                        {['LOT', 'HOUSE', 'CONDO'].map(t => (
                            <TouchableOpacity 
                                key={t} 
                                className={`flex-1 py-3 items-center ${type === t ? 'bg-blue-600' : 'bg-white'}`}
                                onPress={() => setType(t as any)}
                            >
                                <Text className={`capitalize font-semibold ${type === t ? 'text-white' : 'text-gray-600'}`}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                     </View>
                </View>
                <View className="w-1/3 px-2 mb-4">
                     <Text className="text-gray-700 font-semibold mb-2">Status</Text>
                     <View className="flex-row border border-gray-200 rounded-lg overflow-hidden">
                        {['AVAILABLE', 'SOLD', 'RESERVED'].map(s => (
                            <TouchableOpacity 
                                key={s} 
                                className={`flex-1 py-3 items-center ${status === s ? 'bg-blue-600' : 'bg-white'}`}
                                onPress={() => setStatus(s as any)}
                            >
                                <Text className={`capitalize font-semibold ${status === s ? 'text-white' : 'text-gray-600'}`}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                     </View>
                </View>
            </View>
        </View>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Location</Text>
            <InputField label="Address (Street/Subdivision)" value={address} onChangeText={setAddress} />
            <InputField label="Barangay" value={barangay} onChangeText={setBarangay} />
            <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/2 px-2">
                    <InputField label="City/Municipality" value={city} onChangeText={setCity} required />
                </View>
                <View className="w-1/2 px-2">
                    <InputField label="Province" value={province} onChangeText={setProvince} required />
                </View>
            </View>
            
            <View className="flex-row items-center justify-between mt-6 mb-4 border-b border-gray-100 pb-2">
                <Text className="text-lg font-bold text-gray-800">Map Coordinates & Boundaries</Text>
                <TouchableOpacity 
                   className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center shadow-sm"
                   onPress={() => setIsMapModalOpen(true)}
                >
                   <MaterialIcons name="map" size={18} color="white" />
                   <Text className="text-white font-bold ml-2">Open Map Editor</Text>
                </TouchableOpacity>
            </View>

            {latitude && longitude ? (
                <View className="mb-4">
                  <Text className="text-gray-700 font-semibold mb-1">Pin (Lat/Lng):</Text>
                  <Text className="text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">{latitude}, {longitude}</Text>
                  
                  <Text className="text-gray-700 font-semibold mt-3 mb-1">Drawn Boundaries (Polygon Points):</Text>
                  <Text className="text-gray-600 font-mono bg-gray-50 p-3 rounded-lg border border-gray-200">
                     {boundariesRaw ? (() => { 
                         try { 
                             return JSON.parse(boundariesRaw).length + " Points Configured"; 
                         } catch(e) { 
                             return "Invalid/No JSON"; 
                         }
                     })() : "No polygon drawn"}
                  </Text>
                </View>
            ) : (
                <Text className="text-gray-500 italic mb-4">No map location set. Click 'Open Map Editor' above to place the pin.</Text>
            )}

        </View>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Dimensions & Rooms</Text>
            <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/3 px-2">
                    <InputField label="Lot Area (sqm)" value={lotArea} onChangeText={setLotArea} keyboardType="numeric" />
                </View>
                <View className="w-1/3 px-2">
                    <InputField label="Floor Area (sqm)" value={floorArea} onChangeText={setFloorArea} keyboardType="numeric" />
                </View>
                <View className="w-1/3 px-2">
                    <InputField label="Bedrooms" value={bedRooms} onChangeText={setBedRooms} keyboardType="numeric" />
                </View>
                <View className="w-1/2 px-2">
                    <InputField label="Bathrooms" value={bathRooms} onChangeText={setBathRooms} keyboardType="numeric" />
                </View>
                <View className="w-1/2 px-2">
                    <InputField label="Parking Slots" value={parking} onChangeText={setParking} keyboardType="numeric" />
                </View>
            </View>
        </View>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <View className="flex-row flex-wrap -mx-2">
                <View className="w-1/2 px-2">
                    <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Features</Text>
                    <View className="flex-row flex-wrap">
                        {AVAILABLE_FEATURES.map(f => (
                            <TouchableOpacity 
                                key={f.key}
                                className={`mr-2 mb-2 px-3 py-2 rounded-full border ${selectedFeatures.has(f.key) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-300'}`}
                                onPress={() => toggleFeature(f.key)}
                            >
                                <Text className={`${selectedFeatures.has(f.key) ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                                    {f.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View className="w-1/2 px-2">
                    <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Amenities</Text>
                    <View className="flex-row flex-wrap">
                        {AVAILABLE_AMENITIES.map(a => (
                            <TouchableOpacity 
                                key={a.key}
                                className={`mr-2 mb-2 px-3 py-2 rounded-full border ${selectedAmenities.has(a.key) ? 'bg-green-50 border-green-500' : 'bg-white border-gray-300'}`}
                                onPress={() => toggleAmenity(a.key)}
                            >
                                <Text className={`${selectedAmenities.has(a.key) ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                                    {a.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </View>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-12">
          <View className="flex-row flex-wrap items-center justify-between gap-3 mb-4 border-b border-gray-100 pb-4">
            <View>
              <Text className="text-lg font-bold text-gray-800">Photos</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Gallery order = listing order. First photo is the cover. Tap the dashed tile to add from your
                device. Max 10MB each.
              </Text>
            </View>
            <View className="flex-row flex-wrap items-center" style={{ gap: 10 }}>
              {photoSlots.length > 0 && (
                <>
                  <TouchableOpacity
                    className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200"
                    onPress={selectAllPhotos}
                    disabled={loading}
                  >
                    <Text className="text-gray-800 font-semibold text-sm">
                      {selectedPhotoIds.size === photoSlots.length ? 'Clear selection' : 'Select all'}
                    </Text>
                  </TouchableOpacity>
                  {selectedPhotoIds.size > 0 && (
                    <TouchableOpacity
                      className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 flex-row items-center"
                      onPress={deleteSelectedPhotos}
                      disabled={loading}
                    >
                      <MaterialIcons name="delete-outline" size={18} color="#b91c1c" />
                      <Text className="text-red-700 font-semibold text-sm ml-1">
                        Delete ({selectedPhotoIds.size})
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>

          <View className="flex-row flex-wrap" style={{ gap: galleryGap, paddingBottom: 4 }}>
            {photoSlots.map((slot, index) => {
              const uri = slot.kind === 'url' ? (slot.media.url as string) : slot.asset.uri;
              const isStaged = slot.kind === 'staged';
              const isSelected = selectedPhotoIds.has(slot.id);
              const isPrimary = index === 0;
              return (
                <View
                  key={slot.id}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    borderRadius: 14,
                    overflow: 'hidden',
                    borderWidth: 2,
                    borderColor: isSelected ? '#2563eb' : isPrimary ? '#93c5fd' : '#e5e7eb',
                    backgroundColor: '#f1f5f9',
                  }}
                >
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />

                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: 8,
                    }}
                  >
                    <Pressable
                      onPress={() => togglePhotoSelected(slot.id)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.92)',
                        borderRadius: 8,
                        padding: 4,
                      }}
                      hitSlop={8}
                    >
                      <MaterialIcons
                        name={isSelected ? 'check-box' : 'check-box-outline-blank'}
                        size={22}
                        color={isSelected ? '#2563eb' : '#64748b'}
                      />
                    </Pressable>

                    {isPrimary ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: 'rgba(37,99,235,0.95)',
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 8,
                          gap: 4,
                        }}
                      >
                        <MaterialIcons name="star" size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>COVER</Text>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => setAsPrimary(slot.id)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.92)',
                          borderRadius: 8,
                          padding: 4,
                        }}
                        hitSlop={8}
                      >
                        <MaterialIcons name="star-border" size={22} color="#ca8a04" />
                      </Pressable>
                    )}
                  </View>

                  {isStaged && (
                    <View
                      style={{
                        position: 'absolute',
                        left: 8,
                        bottom: 44,
                        backgroundColor: 'rgba(245,158,11,0.95)',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>PENDING UPLOAD</Text>
                    </View>
                  )}

                  <Pressable
                    onPress={() => removePhotoById(slot.id)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      bottom: 8,
                      backgroundColor: 'rgba(254,242,242,0.96)',
                      borderRadius: 999,
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#fecaca',
                      zIndex: 4,
                    }}
                    hitSlop={6}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#dc2626" />
                  </Pressable>
                </View>
              );
            })}

            <Pressable
              onPress={pickImages}
              disabled={loading}
              style={{
                width: tileSize,
                height: tileSize,
                borderRadius: 14,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: '#e2e8f0',
                borderStyle: 'dashed',
                backgroundColor: '#f8fafc',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  top: 14,
                  opacity: 0.45,
                }}
              >
                <View
                  style={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#cbd5e1',
                    width: '72%',
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                    width: '55%',
                    marginBottom: 8,
                  }}
                />
                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e2e8f0',
                    width: '40%',
                  }}
                />
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 14,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#e0e7ff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#c7d2fe',
                  }}
                >
                  <MaterialIcons name="add-photo-alternate" size={26} color="#4f46e5" />
                </View>
                <Text style={{ marginTop: 8, fontSize: 12, fontWeight: '700', color: '#475569' }}>Add photos</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Modal visible={isMapModalOpen} animationType="fade" transparent={true}>
            <View className="flex-1 bg-black/60 justify-center items-center p-6">
                <View className="w-full max-w-5xl h-[85%] bg-white rounded-2xl shadow-xl overflow-hidden p-2">
                    <AdminMapPicker
                        initialCoordinates={(latitude && longitude) ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : undefined}
                        initialBoundaries={(() => {
                            try { return boundariesRaw ? JSON.parse(boundariesRaw) : []; }
                            catch(e) { return []; }
                        })()}
                        onSave={(coords, bounds) => {
                            setLatitude(coords.lat.toString());
                            setLongitude(coords.lng.toString());
                            setBoundariesRaw(bounds.length > 0 ? JSON.stringify(bounds, null, 2) : '');
                            setIsMapModalOpen(false);
                        }}
                        onCancel={() => setIsMapModalOpen(false)}
                    />
                </View>
            </View>
        </Modal>

    </ScrollView>
  );
}
