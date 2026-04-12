import React, { useState, useEffect } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Coordinate } from '../../../constants/mock/mock-properties';
import WebMapView from './webMapView';

// We dynamically try to require react-native-maps for native usage.
// For Web, if it doesn't work, we have a fallback to iframe.
let MapView: any = null;
let Marker: any = null;
let Polygon: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Polygon = Maps.Polygon;
  } catch (e) {
    console.warn("react-native-maps is not available.");
  }
}

interface PropertyMapViewProps {
  coordinates?: Coordinate;
  boundaries?: Coordinate[];
  address: string;
}

export default function PropertyMapView({ coordinates, boundaries, address }: PropertyMapViewProps) {
  if (!coordinates) return null;

  if (Platform.OS === 'web') {
    return (
      <View className="mb-2">
        <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
          Location Map
        </Text>
        <WebMapView coordinates={coordinates} boundaries={boundaries} address={address} />
      </View>
    );
  }

  // Native map rendering
  return (
    <View className="mb-2">
      <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
        Location & Boundaries
      </Text>
      <View className="rounded-[24px] overflow-hidden border border-gray-200 bg-gray-100 relative" style={{ height: 250 }}>
        {MapView ? (
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            mapType="satellite"
            showsUserLocation={false}
          >
            {/* Draw Polygon for Lot Area boundaries */}
            {boundaries && boundaries.length > 0 && (
              <Polygon
                coordinates={boundaries.map(b => ({ latitude: b.lat, longitude: b.lng }))}
                fillColor="rgba(59, 130, 246, 0.4)" // bg-blue-500 with opacity
                strokeColor="rgba(37, 99, 235, 1)"  // border-blue-600
                strokeWidth={3}
              />
            )}
            
            <Marker 
               coordinate={{ latitude: coordinates.lat, longitude: coordinates.lng }} 
               title={address}
            />
          </MapView>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Map unavailable. Please rebuild your dev client.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
