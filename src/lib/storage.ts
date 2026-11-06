import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlarmItem } from './types';

const STORAGE_KEY = 'mezami.alarms.v1';

export async function loadAlarms(): Promise<AlarmItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AlarmItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAlarms(items: AlarmItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 保存に失敗してもアプリは落とさない
  }
}
