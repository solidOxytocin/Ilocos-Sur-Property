import { Stack, useRouter, usePathname } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme, colorScheme as nativewindColorScheme } from 'nativewind';
import { clearAdminAuth, initializeAdminAuth, loginAdmin, subscribeAdminAuth } from '../service/admin-service';
import { getAdminThemePreference, setAdminThemePreference } from './admin-theme-storage';

export default function AdminLayout() {
  const [authed, setAuthed] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const shellBgGate = isDark ? '#020617' : '#f9fafb';
  const shellBgAuth = isDark ? '#020617' : '#f1f5f9';
  const webMinHeight = Platform.OS === 'web' ? ({ minHeight: '100vh' } as const) : {};
  const gateShellStyle = { flex: 1 as const, backgroundColor: shellBgGate, ...webMinHeight };
  const authShellStyle = { flex: 1 as const, backgroundColor: shellBgAuth, ...webMinHeight };

  // Use `nativewindColorScheme.set` (stable) — not `useColorScheme().setColorScheme`, which is a new
  // function every render and must not be listed in effect deps (causes maximum update depth exceeded).

  useEffect(() => {
    return () => {
      nativewindColorScheme.set('system');
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      const [loggedIn, themePref] = await Promise.all([initializeAdminAuth(), getAdminThemePreference()]);
      nativewindColorScheme.set(themePref);
      if (mounted) {
        setAuthed(loggedIn);
        setBootstrapping(false);
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return subscribeAdminAuth((nextState) => {
      setAuthed(nextState);
    });
  }, []);

  const toggleAdminTheme = useCallback(async () => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    nativewindColorScheme.set(next);
    await setAdminThemePreference(next);
  }, [colorScheme]);

  const exitAdminUi = useCallback(() => {
    nativewindColorScheme.set('system');
  }, []);

  const handleLogin = async () => {
    if (submitting) return;
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setError('');
    const loginResult = await loginAdmin(username, password);
    setSubmitting(false);

    if (!loginResult.ok) {
      setError(loginResult.error.message);
      return;
    }

    setAuthed(true);
    setPassword('');
    if (pathname === '/admin' || pathname === '/admin/') {
      router.replace('/admin/properties' as any);
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    setAuthed(false);
    setPassword('');
    setError('');
    nativewindColorScheme.set('system');
    router.replace('/');
  };

  if (bootstrapping) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950" style={gateShellStyle}>
        <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#2563eb'} />
        <Text className="text-slate-500 dark:text-slate-400 mt-3">Preparing admin session...</Text>
      </SafeAreaView>
    );
  }

  if (!authed) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50 dark:bg-slate-950 px-4" style={gateShellStyle}>
        <TouchableOpacity
          accessibilityLabel="Toggle dark mode"
          onPress={toggleAdminTheme}
          className="absolute top-14 right-5 z-20 flex-row items-center justify-center w-11 h-11 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm"
          style={{ top: Platform.OS === 'web' ? 24 : undefined }}
          hitSlop={12}
        >
          <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={22} color={isDark ? '#fcd34d' : '#475569'} />
        </TouchableOpacity>

        <View className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-full max-w-sm border border-slate-100 dark:border-slate-700">
          <Text className="text-2xl font-bold text-center mb-2 text-gray-800 dark:text-slate-100">Admin Login</Text>
          <Text className="text-center text-slate-500 dark:text-slate-400 mb-6">Sign in to manage property listings.</Text>

          <Text className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wide mb-1.5">
            Username
          </Text>
          <TextInput
            className="w-full bg-gray-100 dark:bg-slate-800 dark:text-slate-100 p-4 rounded-lg mb-4 border border-gray-200 dark:border-slate-600"
            placeholder="Enter admin username"
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={(value) => {
              setUsername(value);
              if (error) setError('');
            }}
          />

          <Text className="text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wide mb-1.5">
            Password
          </Text>
          <View className="w-full bg-gray-100 dark:bg-slate-800 rounded-lg mb-4 border border-gray-200 dark:border-slate-600 flex-row items-center">
            <TextInput
              className="flex-1 p-4 dark:text-slate-100"
              placeholder="Enter admin password"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (error) setError('');
              }}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity className="px-3 py-2 mr-1" onPress={() => setShowPassword((v) => !v)}>
              <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </TouchableOpacity>
          </View>

          {error ? <Text className="text-red-500 dark:text-red-400 mb-4 text-center">{error}</Text> : null}

          <TouchableOpacity
            className={`w-full p-4 rounded-lg items-center ${submitting ? 'bg-blue-400 dark:bg-blue-500' : 'bg-blue-600 dark:bg-blue-500'}`}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity className="mt-6 items-center" onPress={() => { exitAdminUi(); router.replace('/'); }}>
            <Text className="text-blue-500 dark:text-sky-400">Return to App</Text>
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
    <SafeAreaView className="flex-1 bg-slate-100 dark:bg-slate-950" style={authShellStyle}>
      <View
        className="flex-row items-center justify-between bg-white dark:bg-slate-900 px-5 py-3.5 z-10 border-b border-slate-200/80 dark:border-slate-700"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.35 : 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View
            className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 items-center justify-center"
            style={{ shadowColor: '#2563eb', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
          >
            <MaterialIcons name="admin-panel-settings" size={22} color="#fff" />
          </View>
          <View>
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Ilocos Sur Properties</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">Admin console</Text>
          </View>
        </View>

        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Pressable
            onPress={() => router.push('/admin/properties' as any)}
            className={`flex-row items-center px-4 py-2.5 rounded-lg border ${
              onProperties ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800' : 'border-transparent dark:border-transparent'
            }`}
            style={({ hovered }) =>
              hovered && !onProperties ? { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' } : undefined}
          >
            <MaterialIcons name="home-work" size={20} color={onProperties ? '#2563eb' : isDark ? '#94a3b8' : '#64748b'} />
            <Text
              className={`ml-2 font-semibold ${onProperties ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300'}`}
            >
              Listings
            </Text>
          </Pressable>

          <TouchableOpacity
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex-row items-center px-3.5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600"
            onPress={toggleAdminTheme}
          >
            <MaterialIcons name={isDark ? 'light-mode' : 'dark-mode'} size={22} color={isDark ? '#fcd34d' : '#475569'} />
          </TouchableOpacity>

          <Pressable
            onPress={handleLogout}
            className="flex-row items-center px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/80"
            style={({ hovered }) => (hovered ? { backgroundColor: isDark ? '#450a0a' : '#fee2e2' } : undefined)}
          >
            <MaterialIcons name="logout" size={18} color={isDark ? '#f87171' : '#b91c1c'} />
            <Text className="text-red-700 dark:text-red-300 font-semibold ml-1.5">Log out</Text>
          </Pressable>
        </View>
      </View>
      {/* Padded workspace + stack scenes: RN-web native-stack defaults to white; force shell color so rounded table corners don’t sit on white. */}
      <View
        className="flex-1 p-4 sm:p-6 w-full bg-slate-100 dark:bg-slate-950"
        style={{ flex: 1, minHeight: 0, width: '100%', maxWidth: '100%', backgroundColor: shellBgAuth }}
      >
        <View style={{ flex: 1, minHeight: 0, backgroundColor: shellBgAuth }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                flex: 1,
                backgroundColor: shellBgAuth,
              },
            }}
            style={{ flex: 1, minHeight: 0, backgroundColor: shellBgAuth }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
