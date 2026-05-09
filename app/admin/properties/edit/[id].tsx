import { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import PropertyForm from '../../components/PropertyForm';
import { getPropertyById, type ApiFailure } from '../../../service/property-service';
import { Property } from '../../../constants/mock/mock-properties';
import { DataFetchState } from '../../../modules/generics/components/DataFetchState';

export default function EditPropertyScreen() {
  const { id } = useLocalSearchParams();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<ApiFailure | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    setFetchError(null);
    setNotFound(false);
    const result = await getPropertyById(id as string);
    if (!result.ok) {
      if (result.error.code === 'not_found') {
        setNotFound(true);
        setProperty(null);
      } else {
        setFetchError(result.error);
        setProperty(null);
      }
    } else {
      setProperty(result.data);
    }
    setLoading(false);
  }, [id, retryKey]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  if (loading) {
     return (
        <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950">
           <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#2563eb'} />
           <Text className="mt-4 text-gray-500 dark:text-slate-400">Loading Property Data...</Text>
        </View>
     );
  }

  if (fetchError) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-slate-950 px-4 justify-center">
        <DataFetchState
          variant={fetchError.code === 'offline' ? 'offline' : 'error'}
          title={fetchError.code === 'offline' ? 'You’re offline' : 'Couldn’t load property'}
          message={fetchError.message}
          onRetry={retry}
          retryLabel="Try again"
        />
      </View>
    );
  }

  if (notFound || !property) {
      return (
         <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950 px-6">
            <DataFetchState
              variant="empty"
              title="Property not found"
              message="This listing isn’t available or may have been removed."
            />
         </View>
      );
  }

  return <PropertyForm key={property.id} isEdit={true} initialData={property} />;
}
