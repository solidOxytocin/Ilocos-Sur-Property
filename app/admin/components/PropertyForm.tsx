import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { createProperty, updateProperty } from '../../service/admin-service';
import { Property, Media, Feature, Amenity } from '../../constants/mock/mock-properties';
import AdminMapPicker from './AdminMapPicker';

interface PropertyFormProps {
  initialData?: Property;
  isEdit?: boolean;
}

export default function PropertyForm({ initialData, isEdit = false }: PropertyFormProps) {
    console.log(initialData)
  const router = useRouter();
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
  
  // Media (URLs only)
  const [media, setMedia] = useState<Partial<Media>[]>(initialData?.media || []);
  const [newImageUrl, setNewImageUrl] = useState('');

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

  const addImage = () => {
      if (newImageUrl.trim()) {
          setMedia([...media, { url: newImageUrl, type: 'image', isPrimary: media.length === 0 }]);
          setNewImageUrl('');
      }
  };

  const removeImage = (index: number) => {
      setMedia(media.filter((_, i) => i !== index));
  };

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
        media: media.map((m, i) => ({
            url: m.url,
            isPrimary: i === 0,
            type: 'image'
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
            <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Media (URLs)</Text>
            {media.map((m, index) => (
                <View key={index} className="flex-row items-center mb-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <Text className="flex-1 text-gray-700" numberOfLines={1}>{m.url}</Text>
                    {index === 0 && <Text className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md mr-3 font-semibold">Primary</Text>}
                    <TouchableOpacity onPress={() => removeImage(index)} className="p-2 bg-red-50 rounded-full">
                        <MaterialIcons name="delete" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            ))}
            <View className="flex-row mt-4 space-x-2">
                <TextInput
                    className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-gray-800"
                    placeholder="https://example.com/image.jpg"
                    value={newImageUrl}
                    onChangeText={setNewImageUrl}
                />
                <TouchableOpacity 
                    className="bg-gray-800 px-4 py-3 rounded-lg justify-center border border-gray-700 flex-row items-center"
                    onPress={addImage}
                >
                    <MaterialIcons name="add" size={20} color="white" />
                    <Text className="text-white font-semibold ml-1">Add URL</Text>
                </TouchableOpacity>
            </View>
            <Text className="text-gray-400 text-xs mt-2 italic">Note: Real image uploads will be implemented in a future update.</Text>
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
