import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { AlarmItem, createId, nextFireDate } from '../lib/types';
import { loadAlarms, saveAlarms } from '../lib/storage';
import {
  initAlarmKit,
  ensureAuthorization,
  syncAlarm,
  removeAlarm,
} from '../lib/alarmService';

export type AlarmDraft = Omit<AlarmItem, 'id' | 'isEnabled'>;

interface AlarmContextValue {
  items: AlarmItem[];
  loaded: boolean;
  next: { item: AlarmItem; date: Date } | null;
  addAlarm: (draft: AlarmDraft) => Promise<void>;
  updateAlarm: (item: AlarmItem) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string, enabled: boolean) => Promise<void>;
}

const AlarmContext = createContext<AlarmContextValue | null>(null);

function sorted(items: AlarmItem[]): AlarmItem[] {
  return [...items].sort((a, b) => a.hour - b.hour || a.minute - b.minute);
}

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<AlarmItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    initAlarmKit();
    loadAlarms().then((stored) => {
      setItems(sorted(stored));
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((nextItems: AlarmItem[]) => {
    const ordered = sorted(nextItems);
    setItems(ordered);
    saveAlarms(ordered);
  }, []);

  const scheduleWithAuth = useCallback(async (item: AlarmItem) => {
    const ok = await ensureAuthorization();
    if (!ok) {
      Alert.alert(
        'アラームの許可が必要です',
        '設定アプリでこのアプリのアラーム許可をオンにしてください。',
      );
      return;
    }
    try {
      await syncAlarm(item);
    } catch {
      Alert.alert('登録に失敗しました', 'アラームをシステムに登録できませんでした。');
    }
  }, []);

  const addAlarm = useCallback(
    async (draft: AlarmDraft) => {
      const item: AlarmItem = { ...draft, id: createId(), isEnabled: true };
      persist([...items, item]);
      await scheduleWithAuth(item);
    },
    [items, persist, scheduleWithAuth],
  );

  const updateAlarm = useCallback(
    async (item: AlarmItem) => {
      persist(items.map((it) => (it.id === item.id ? item : it)));
      if (item.isEnabled) {
        await scheduleWithAuth(item);
      } else {
        await removeAlarm(item.id);
      }
    },
    [items, persist, scheduleWithAuth],
  );

  const deleteAlarm = useCallback(
    async (id: string) => {
      persist(items.filter((it) => it.id !== id));
      await removeAlarm(id);
    },
    [items, persist],
  );

  const toggleAlarm = useCallback(
    async (id: string, enabled: boolean) => {
      const target = items.find((it) => it.id === id);
      if (!target) return;
      const updated = { ...target, isEnabled: enabled };
      persist(items.map((it) => (it.id === id ? updated : it)));
      if (enabled) {
        await scheduleWithAuth(updated);
      } else {
        await removeAlarm(id);
      }
    },
    [items, persist, scheduleWithAuth],
  );

  const next = useMemo(() => {
    let best: { item: AlarmItem; date: Date } | null = null;
    for (const item of items) {
      const date = nextFireDate(item);
      if (date && (!best || date < best.date)) best = { item, date };
    }
    return best;
  }, [items]);

  const value = useMemo(
    () => ({ items, loaded, next, addAlarm, updateAlarm, deleteAlarm, toggleAlarm }),
    [items, loaded, next, addAlarm, updateAlarm, deleteAlarm, toggleAlarm],
  );

  return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>;
}

export function useAlarms(): AlarmContextValue {
  const ctx = useContext(AlarmContext);
  if (!ctx) throw new Error('useAlarms must be used within AlarmProvider');
  return ctx;
}
