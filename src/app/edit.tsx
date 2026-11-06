import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useAlarms } from '../store/AlarmContext';
import { WEEKDAY_SYMBOLS } from '../lib/types';

const SNOOZE_OPTIONS = [0, 5, 9, 10, 15];

export default function AlarmEditScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { items, addAlarm, updateAlarm, deleteAlarm } = useAlarms();
  const existing = useMemo(() => items.find((it) => it.id === id), [items, id]);

  const [time, setTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(existing?.hour ?? 7, existing?.minute ?? 15, 0, 0);
    return d;
  });
  const [label, setLabel] = useState(existing?.label ?? 'アラーム');
  const [weekdays, setWeekdays] = useState<Set<number>>(
    new Set(existing?.repeatWeekdays ?? []),
  );
  const [snooze, setSnooze] = useState(existing?.snoozeMinutes ?? 5);

  const toggleWeekday = (day: number) => {
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const save = async () => {
    const draft = {
      hour: time.getHours(),
      minute: time.getMinutes(),
      label: label.trim(),
      repeatWeekdays: [...weekdays].sort((a, b) => a - b),
      snoozeMinutes: snooze,
    };
    if (existing) {
      await updateAlarm({ ...existing, ...draft });
    } else {
      await addAlarm(draft);
    }
    router.back();
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert('アラームを削除', 'このアラームを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteAlarm(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <DateTimePicker
        value={time}
        mode="time"
        display="spinner"
        themeVariant="dark"
        onChange={(_, selected) => selected && setTime(selected)}
        style={styles.picker}
      />

      <Text style={styles.sectionLabel}>ラベル</Text>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="アラーム"
        placeholderTextColor="#636366"
        style={styles.input}
      />

      <Text style={styles.sectionLabel}>繰り返し</Text>
      <View style={styles.chipRow}>
        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
          const active = weekdays.has(day);
          return (
            <Pressable
              key={day}
              onPress={() => toggleWeekday(day)}
              style={[styles.dayChip, active && styles.dayChipActive]}
            >
              <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                {WEEKDAY_SYMBOLS[day - 1]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.quickRow}>
        <Pressable onPress={() => setWeekdays(new Set([2, 3, 4, 5, 6]))}>
          <Text style={styles.quickText}>平日</Text>
        </Pressable>
        <Pressable onPress={() => setWeekdays(new Set([1, 7]))}>
          <Text style={styles.quickText}>週末</Text>
        </Pressable>
        <Pressable onPress={() => setWeekdays(new Set([1, 2, 3, 4, 5, 6, 7]))}>
          <Text style={styles.quickText}>毎日</Text>
        </Pressable>
        <Pressable onPress={() => setWeekdays(new Set())}>
          <Text style={styles.quickText}>なし（1回のみ）</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>スヌーズ</Text>
      <View style={styles.chipRow}>
        {SNOOZE_OPTIONS.map((min) => {
          const active = snooze === min;
          return (
            <Pressable
              key={min}
              onPress={() => setSnooze(min)}
              style={[styles.snoozeChip, active && styles.dayChipActive]}
            >
              <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                {min === 0 ? 'なし' : `${min}分`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.saveButton} onPress={save}>
        <Text style={styles.saveButtonText}>保存</Text>
      </Pressable>

      {existing && (
        <Pressable style={styles.deleteButton} onPress={confirmDelete}>
          <Text style={styles.deleteButtonText}>このアラームを削除</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { padding: 20, paddingBottom: 40 },
  picker: { alignSelf: 'center' },
  sectionLabel: {
    color: '#98989f',
    fontSize: 13,
    marginTop: 22,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1c1c1e',
    color: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snoozeChip: {
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: { backgroundColor: '#FF9500' },
  dayChipText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  dayChipTextActive: { color: '#ffffff' },
  quickRow: { flexDirection: 'row', gap: 18, marginTop: 12 },
  quickText: { color: '#FF9500', fontSize: 14 },
  saveButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 34,
  },
  saveButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  deleteButton: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  deleteButtonText: { color: '#FF453A', fontSize: 16 },
});
