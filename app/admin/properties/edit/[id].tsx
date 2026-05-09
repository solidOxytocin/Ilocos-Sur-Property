import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import PropertyForm from '../../components/PropertyForm';
import { getPropertyById } from '../../../service/property-service';
import { Property } from '../../../constants/mock/mock-properties';

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getPropertyById(id as string).then((data: Property | null) => {
        setProperty(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
     return (
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950">
           <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#2563eb'} />
           <Text className="mt-4 text-gray-500 dark:text-slate-400">Loading Property Data...</Text>
        </View>
     );
  }

  if (!property) {
      return (
         <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950 px-6">
            <Text className="text-xl font-bold text-gray-800 dark:text-slate-100 text-center">Property Not Found</Text>
         </View>
      );
  }

  return <PropertyForm key={property.id} isEdit={true} initialData={property} />;
}
