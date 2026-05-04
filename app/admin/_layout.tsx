import { Stack, useRouter, usePathname } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

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
      // Default admin URL is `/admin`, which has no stack screen without a redirect — land on listings.
      if (pathname === '/admin' || pathname === '/admin/') {
        router.replace('/admin/properties' as any);
      }
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

  const onProperties =
    pathname === '/admin/properties' ||
    pathname === '/admin/properties/' ||
    (pathname?.startsWith('/admin/properties') ?? false);

  return (
    <SafeAreaView className="flex-1 bg-slate-100" style={{ flex: 1 }}>
      <View
        className="flex-row items-center justify-between bg-white px-5 py-3.5 z-10 border-b border-slate-200/80"
        style={{
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View
            className="w-10 h-10 rounded-xl bg-blue-600 items-center justify-center"
            style={{ shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
          >
            <MaterialIcons name="admin-panel-settings" size={22} color="#fff" />
          </View>
          <View>
            <Text className="text-lg font-bold text-slate-900 tracking-tight">Ilocos Sur Properties</Text>
            <Text className="text-xs text-slate-500 font-medium">Admin console</Text>
          </View>
        </View>

        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Pressable
            onPress={() => router.push('/admin/properties' as any)}
            className={`flex-row items-center px-4 py-2.5 rounded-lg border ${onProperties ? 'bg-blue-50 border-blue-200' : 'border-transparent'}`}
            style={({ hovered }) => (hovered && !onProperties ? { backgroundColor: '#f1f5f9' } : undefined)}
          >
            <MaterialIcons name="home-work" size={20} color={onProperties ? '#2563eb' : '#64748b'} />
            <Text className={`ml-2 font-semibold ${onProperties ? 'text-blue-700' : 'text-slate-600'}`}>Listings</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            className="flex-row items-center px-4 py-2.5 rounded-lg bg-red-50 border border-red-100"
            style={({ hovered }) => (hovered ? { backgroundColor: '#fee2e2' } : undefined)}
          >
            <MaterialIcons name="logout" size={18} color="#b91c1c" />
            <Text className="text-red-700 font-semibold ml-1.5">Log out</Text>
          </Pressable>
        </View>
      </View>
      <View
        className="flex-1 p-4 sm:p-6 w-full"
        style={{ flex: 1, minHeight: 0, width: '100%', maxWidth: '100%' }}
      >
        <Stack
          screenOptions={{ headerShown: false }}
          style={{ flex: 1, minHeight: 0 }}
        />
      </View>
    </SafeAreaView>
  );
}
