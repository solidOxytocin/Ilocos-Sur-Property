import React from 'react';
import { View, Text } from 'react-native';
import { Coordinate } from '../../../constants/mock/mock-properties';
import WebMapView from './webMapView';

interface PropertyMapViewProps {
  coordinates?: Coordinate;
  boundaries?: Coordinate[];
  address: string;
}

export default function PropertyMapView({ coordinates, boundaries, address }: PropertyMapViewProps) {
  if (!coordinates) return null;

  // On Web, we simply render the WebMapView.
  // Mobile devices will automatically use propertyMapView.native.tsx
  return (
    <View className="mb-2">
      <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
        Location Map
      </Text>
      <WebMapView coordinates={coordinates} boundaries={boundaries} address={address} />
    </View>
  );
}
