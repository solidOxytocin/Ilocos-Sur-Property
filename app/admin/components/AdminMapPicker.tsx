import React from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { Coordinate } from '../../../../constants/mock/mock-properties';
import WebAdminMapPicker from './WebAdminMapPicker';

interface AdminMapPickerProps {
  initialCoordinates?: Coordinate;
  initialBoundaries?: Coordinate[];
  onSave: (coords: Coordinate, boundaries: Coordinate[]) => void;
  onCancel: () => void;
}

export default function AdminMapPicker(props: AdminMapPickerProps) {
  if (Platform.OS === 'web') {
    return <WebAdminMapPicker {...props} />;
  }

  // Fallback for native devices
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900 rounded-xl p-6 h-[400px] border border-slate-200 dark:border-slate-700">
      <Text className="text-lg font-bold text-gray-800 dark:text-slate-100 text-center mb-2">
        Interactive Map Editor available on Web Browser
      </Text>
      <Text className="text-gray-500 dark:text-slate-400 text-center mb-4">
        Since the admin portal map drawing targets the web, please open this admin panel in your desktop browser or tablet to draw map areas.
      </Text>
      <TouchableOpacity 
          onPress={props.onCancel} 
          className="px-6 py-3 rounded-lg bg-blue-600 dark:bg-blue-500"
      >
          <Text className="font-bold text-white">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
