import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polygon } from 'react-native-maps';
import { Coordinate } from '../../../constants/mock/mock-properties';

interface PropertyMapViewProps {
  coordinates?: Coordinate;
  boundaries?: Coordinate[];
  address: string;
}

export default function PropertyMapView({ coordinates, boundaries, address }: PropertyMapViewProps) {
  if (!coordinates) return null;
  return (
    <View className="mb-2">
      <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
        Location Map
      </Text>
      <View className="rounded-[24px] overflow-hidden border border-gray-200 bg-gray-100 relative" style={{ height: 250 }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: coordinates.lat,
            longitude: coordinates.lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          mapType="hybrid"
          showsUserLocation={false}
        >
          {/* Draw Polygon for Lot Area boundaries */}
          {boundaries && boundaries.length > 0 && (
            <Polygon
              coordinates={boundaries.map(b => ({ latitude: b.lat, longitude: b.lng }))}
              fillColor="rgba(59, 130, 246, 0.4)"
              strokeColor="rgba(37, 99, 235, 1)"
              strokeWidth={3}
            />
          )}
          
          <Marker 
             coordinate={{ latitude: coordinates.lat, longitude: coordinates.lng }} 
             title={address}
          />
        </MapView>
      </View>
    </View>
  );
}
