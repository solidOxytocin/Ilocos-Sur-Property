import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { GoogleMap, useJsApiLoader, PolygonF, MarkerF, Autocomplete } from '@react-google-maps/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Coordinate } from '../../../../constants/mock/mock-properties';

interface WebAdminMapPickerProps {
  initialCoordinates?: Coordinate;
  initialBoundaries?: Coordinate[];
  onSave: (coords: Coordinate, boundaries: Coordinate[]) => void;
  onCancel: () => void;
}

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px',
};

const libraries: any = ['places'];

export default function WebAdminMapPicker({ initialCoordinates, initialBoundaries, onSave, onCancel }: WebAdminMapPickerProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const [map, setMap] = useState<any>(null);
  const [mode, setMode] = useState<'pin' | 'boundary'>('pin');
  
  const [coordinates, setCoordinates] = useState<Coordinate | null>(initialCoordinates || null);
  const [boundaries, setBoundaries] = useState<Coordinate[]>(initialBoundaries || []);
  
  const [autocomplete, setAutocomplete] = useState<any>(null);

  const defaultCenter = coordinates || { lat: 17.5747, lng: 120.3869 }; // Vigan City default

  const onLoad = useCallback(function callback(mapInstance: any) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const onAutocompleteLoad = (ac: any) => {
    setAutocomplete(ac);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoordinates({ lat, lng });
        map?.panTo({ lat, lng });
        map?.setZoom(17);
      }
    }
  };

  const handleMapClick = (e: any) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (mode === 'pin') {
      setCoordinates({ lat, lng });
    } else if (mode === 'boundary') {
      setBoundaries([...boundaries, { lat, lng }]);
    }
  };

  const clearBoundaries = () => {
    setBoundaries([]);
  };

  const handleSave = () => {
    if (!coordinates) {
      alert("Please place a Location Pin on the map first.");
      return;
    }
    onSave(coordinates, boundaries);
  };

  if (!apiKey) return <Text className={isDark ? 'text-slate-200' : ''}>Google Maps API Key not configured.</Text>;
  if (loadError) return <Text className={isDark ? 'text-red-300' : ''}>Map Error: {loadError.message}</Text>;
  if (!isLoaded)
    return (
      <View className="h-[500px] flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <Text className={isDark ? 'text-slate-300' : 'text-gray-700'}>Loading interactive map...</Text>
      </View>
    );

  const polygonPaths = boundaries.map(b => ({ lat: b.lat, lng: b.lng }));

  return (
    <View className="flex-1 bg-white dark:bg-slate-900 flex flex-col h-full rounded-xl overflow-hidden p-4">
      {/* Top Controls Toolbar */}
      <View className="flex-row items-center justify-between z-10 mb-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-3">
        <View className="flex-row items-center space-x-2 flex-1">
           {/* Editor Modes */}
           <TouchableOpacity 
              className={`px-4 py-2 rounded-lg flex-row items-center ${mode === 'pin' ? 'bg-red-50 dark:bg-red-950/50 border border-red-500' : 'bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-transparent'}`}
              onPress={() => setMode('pin')}
           >
              <MaterialCommunityIcons name="map-marker" size={20} color={mode === 'pin' ? '#ef4444' : isDark ? '#94a3b8' : '#6b7280'} />
              <Text className={`ml-2 font-bold ${mode === 'pin' ? 'text-red-700 dark:text-red-300' : 'text-gray-600 dark:text-slate-300'}`}>1. Pin Location</Text>
           </TouchableOpacity>

           <TouchableOpacity 
              className={`px-4 py-2 rounded-lg flex-row items-center ${mode === 'boundary' ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-500' : 'bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-transparent'}`}
              onPress={() => setMode('boundary')}
           >
              <MaterialCommunityIcons name="vector-polygon" size={20} color={mode === 'boundary' ? '#3b82f6' : isDark ? '#94a3b8' : '#6b7280'} />
              <Text className={`ml-2 font-bold ${mode === 'boundary' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-slate-300'}`}>2. Draw Area</Text>
           </TouchableOpacity>

           {boundaries.length > 0 && mode === 'boundary' && (
             <TouchableOpacity className="px-3 py-2" onPress={clearBoundaries}>
                <Text className="text-red-500 dark:text-red-400 font-semibold hover:underline">Clear Area</Text>
             </TouchableOpacity>
           )}
        </View>

        {/* Search */}
        <View className="flex-[0.8] relative z-50">
           <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
           >
               {/* Note: React Native TextInput won't hook into Google Autocomplete easily here because Autocomplete strictly expects a DOM input. We supply native input, but with a web class trick */}
              <input
                type="text"
                placeholder="Search location to fly to..."
                style={{
                  boxSizing: 'border-box',
                  border: isDark ? '1px solid #475569' : '1px solid #e5e7eb',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#f1f5f9' : '#0f172a',
                  width: '100%',
                  height: '40px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  outline: 'none',
                  fontSize: '14px',
                }}
              />
           </Autocomplete>
        </View>
      </View>

      {/* Map Segment */}
      <View className="flex-1 rounded-xl overflow-hidden border border-gray-300 dark:border-slate-600 relative bg-gray-100 dark:bg-slate-950">
         <View className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-800/95 px-3 py-2 rounded-lg shadow-sm backdrop-blur-md border border-slate-200/80 dark:border-slate-600">
            <Text className="text-sm font-bold text-gray-800 dark:text-slate-100">
                {mode === 'pin' ? "Click anywhere on the map to drop the marker." : "Click multiple points on the map to draw corners."}
            </Text>
         </View>
         
         <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={{
                mapTypeId: 'satellite',
                streetViewControl: false,
                mapTypeControl: false,
                draggableCursor: mode === 'boundary' ? 'crosshair' : 'default',
            }}
         >
            {coordinates && (
                <MarkerF position={coordinates} />
            )}
            
            {/* Realtime boundaries drawing */}
            {boundaries.length > 0 && (
                <PolygonF
                  paths={polygonPaths}
                  options={{
                      fillColor: 'rgba(59, 130, 246, 0.4)',
                      fillOpacity: 1,
                      strokeColor: 'rgba(37, 99, 235, 1)',
                      strokeOpacity: 1,
                      strokeWeight: 3,
                      clickable: false,
                  }}
                />
            )}

            {/* Visualize boundary points while drawing */}
            {mode === 'boundary' && boundaries.map((p, idx) => (
                <MarkerF 
                    key={idx} 
                    position={p}
                    icon={{
                        path: 'M -4,0 A 4,4 0 1,1 4,0 A 4,4 0 1,1 -4,0',
                        fillColor: '#ffffff',
                        fillOpacity: 1,
                        strokeColor: '#3b82f6',
                        strokeWeight: 2,
                    }}
                />
            ))}
         </GoogleMap>
      </View>

      {/* Footer controls */}
      <View className="pt-4 flex-row justify-end space-x-3 items-center">
         <View className="flex-1">
             {coordinates ? <Text className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Location Set</Text> : <Text className="text-xs text-red-500 dark:text-red-400 font-semibold">✗ Pin Required</Text>}
             {boundaries.length >= 3 ? <Text className="text-xs text-green-600 dark:text-green-400 font-semibold">✓ Custom Polygon drawn ({boundaries.length} points)</Text> : <Text className="text-xs text-gray-500 dark:text-slate-400 font-semibold">Area: none (or drawing incomplete)</Text>}
         </View>

         <TouchableOpacity onPress={onCancel} className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-slate-700">
             <Text className="font-bold text-gray-700 dark:text-slate-200">Cancel</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
             onPress={handleSave} 
             className={`px-6 py-3 rounded-lg ${coordinates ? 'bg-blue-600 dark:bg-blue-500' : 'bg-blue-300 dark:bg-blue-900'}`}
         >
             <Text className="font-bold text-white">Save Coordinates & Area</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}
