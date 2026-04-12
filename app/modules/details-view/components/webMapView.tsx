import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { GoogleMap, useJsApiLoader, PolygonF, MarkerF } from '@react-google-maps/api';
import { Coordinate } from '../../../constants/mock/mock-properties';

interface WebMapViewProps {
  coordinates: Coordinate;
  boundaries?: Coordinate[];
  address: string;
}

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '24px',
};

// Fallback plain iframe component
const IframeFallback = ({ coordinates, boundaries }: { coordinates: Coordinate, boundaries?: Coordinate[] }) => (
  <View className="mb-2">
    <View className="rounded-[24px] overflow-hidden border border-gray-200">
      <iframe
        width="100%"
        height="250"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`}
      />
    </View>
    {boundaries && boundaries.length > 0 && (
      <Text className="text-xs text-gray-400 mt-2 italic flex-row items-center">
         Note: Free-tier limit reached. Lot polygons are temporarily disabled.
      </Text>
    )}
  </View>
);

export default function WebMapView({ coordinates, boundaries, address }: WebMapViewProps) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <IframeFallback coordinates={coordinates} boundaries={boundaries} />;
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(mapInstance: any) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  if (loadError) {
    // If the API key is invalid, or quota is reached, or network fails, fallback to iframe
    return <IframeFallback coordinates={coordinates} boundaries={boundaries} />;
  }

  if (!isLoaded) {
    return (
      <View className="rounded-[24px] overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center h-[250px]">
        <Text className="text-gray-500">Loading Map...</Text>
      </View>
    );
  }

  const polygonPaths = boundaries ? boundaries.map(b => ({ lat: b.lat, lng: b.lng })) : [];

  return (
    <View className="mb-2">
      <View className="rounded-[24px] overflow-hidden border border-gray-200 relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={coordinates}
          zoom={16}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeId: 'satellite',
            disableDefaultUI: false, // Or true based on preference
            streetViewControl: false,
          }}
        >
          {boundaries && boundaries.length > 0 && (
            <PolygonF
              paths={polygonPaths}
              options={{
                fillColor: 'rgba(59, 130, 246, 0.4)',
                fillOpacity: 1,
                strokeColor: 'rgba(37, 99, 235, 1)',
                strokeOpacity: 1,
                strokeWeight: 3,
              }}
            />
          )}
          <MarkerF position={coordinates} title={address} />
        </GoogleMap>
      </View>
    </View>
  );
}
