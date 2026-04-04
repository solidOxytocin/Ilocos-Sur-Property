import { Stack, useRouter, usePathname } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState, useEffect } from 'react';

// A simple mock authentication state
let isAuthenticated = false;

export default function AdminLayout() {
  const [authed, setAuthed] = useState(isAuthenticated);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
     setAuthed(isAuthenticated);
  }, [pathname]);

  const handleLogin = () => {
    // Mock password for development
    if (password === 'admin123') {
      isAuthenticated = true;
      setAuthed(true);
      setError('');
    } else {
      setError('Invalid password. Try admin123');
    }
  };

  const handleLogout = () => {
    isAuthenticated = false;
    setAuthed(false);
    router.replace('/');
  };

  if (!authed) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <View className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <Text className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</Text>
          <TextInput
            className="w-full bg-gray-100 p-4 rounded-lg mb-4 border border-gray-200"
            placeholder="Enter Admin Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />
          {error ? <Text className="text-red-500 mb-4 text-center">{error}</Text> : null}
          <TouchableOpacity 
            className="w-full bg-blue-600 p-4 rounded-lg items-center"
            onPress={handleLogin}
          >
            <Text className="text-white font-bold text-lg">Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="mt-6 items-center"
            onPress={() => router.replace('/')}
          >
            <Text className="text-blue-500">Return to App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between bg-white px-6 py-4 shadow-sm z-10 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">IS Properties Admin</Text>
        <View className="flex-row space-x-4">
            <TouchableOpacity onPress={() => router.push('/admin/properties' as any)} className="px-4 py-2">
                <Text className="text-gray-600 font-semibold hover:text-blue-600">Properties</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} className="px-4 py-2 bg-red-50 rounded-lg">
               <Text className="text-red-600 font-semibold">Logout</Text>
            </TouchableOpacity>
        </View>
      </View>
      <View className="flex-1 p-6 max-w-7xl mx-auto w-full">
         <Stack screenOptions={{ headerShown: false }} />
      </View>
    </SafeAreaView>
  );
}
