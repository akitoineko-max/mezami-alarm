import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useAlarms } from '../store/AlarmContext';
import { AlarmItem, repeatText, timeString } from '../lib/types';

function NextAlarmBanner() {
  const { next } = useAlarms();
  if (!next) return null;
  const { item, date } = next;
  const dateLabel = `${date.getMonth() + 1}/${date.getDate()}（${'日月火水木金土'[date.getDay()]}）`;
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerCaption}>次のアラーム</Text>
      <Text style={styles.bannerText}>
        {dateLabel} {timeString(item)} — {item.label || 'アラーム'}
      </Text>
    </View>
  );
}

function AlarmRow({ item }: { item: AlarmItem }) {
  const { toggleAlarm } = useAlarms();
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: '/edit', params: { id: item.id } })}
    >
      <View style={[styles.rowText, !item.isEnabled && styles.dimmed]}>
        <Text style={styles.time}>{timeString(item)}</Text>
        <Text style={styles.sub}>
          {item.label || 'アラーム'} · {repeatText(item)}
          {item.snoozeMinutes > 0 ? ` · スヌーズ${item.snoozeMinutes}分` : ''}
        </Text>
      </View>
      <Switch
        value={item.isEnabled}
        onValueChange={(v) => toggleAlarm(item.id, v)}
        trackColor={{ true: '#FF9500', false: '#3a3a3c' }}
      />
    </Pressable>
  );
}

export default function AlarmListScreen() {
  const { items, loaded } = useAlarms();
  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlarmRow item={item} />}
        ListHeaderComponent={<NextAlarmBanner />}
        ListEmptyComponent={
          loaded ? (
            <Text style={styles.empty}>
              アラームがありません。{'\n'}右下の＋から追加してください。
            </Text>
          ) : undefined
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/edit')}
        accessibilityLabel="アラームを追加"
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  banner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2c2c2e',
  },
  bannerCaption: { color: '#FF9500', fontSize: 12, marginBottom: 2 },
  bannerText: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  rowText: { flex: 1 },
  dimmed: { opacity: 0.4 },
  time: { color: '#ffffff', fontSize: 38, fontWeight: '200' },
  sub: { color: '#98989f', fontSize: 13, marginTop: 2 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2c2c2e',
    marginLeft: 20,
  },
  empty: {
    color: '#98989f',
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FF9500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#ffffff', fontSize: 30, lineHeight: 34 },
});
