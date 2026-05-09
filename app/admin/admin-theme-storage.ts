import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = 'ilocos-admin-color-scheme';

export type AdminColorSchemePreference = 'light' | 'dark';

export async function getAdminThemePreference(): Promise<AdminColorSchemePreference> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    }
    const v = await AsyncStorage.getItem(STORAGE_KEY);
    return v === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export async function setAdminThemePreference(pref: AdminColorSchemePreference): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, pref);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // persistence is optional
  }
}
