import {
  configure,
  requestAuthorization,
  scheduleAlarm,
  scheduleRepeatingAlarm,
  cancelAlarm,
} from 'expo-alarm-kit';
import { AlarmItem, nextFireDate } from './types';

export const APP_GROUP = 'group.jp.akito.mezami';

let configured = false;

/** アプリ起動時に1回呼ぶ。App Group に接続できたら true。 */
export function initAlarmKit(): boolean {
  if (configured) return true;
  try {
    configured = configure(APP_GROUP);
  } catch {
    configured = false;
  }
  return configured;
}

export async function ensureAuthorization(): Promise<boolean> {
  try {
    const status = await requestAuthorization();
    return status === 'authorized';
  } catch {
    return false;
  }
}

/** アラームの設定内容を AlarmKit 側へ反映する（既存分は貼り直す）。 */
export async function syncAlarm(item: AlarmItem): Promise<void> {
  try {
    await cancelAlarm(item.id);
  } catch {
    // 未登録なら何もしない
  }
  if (!item.isEnabled) return;

  const common = {
    id: item.id,
    title: item.label.trim() === '' ? 'アラーム' : item.label,
    tintColor: '#FF9500',
    stopButtonLabel: '止める',
    ...(item.snoozeMinutes > 0
      ? {
          doSnoozeIntent: true,
          launchAppOnSnooze: false,
          snoozeDuration: item.snoozeMinutes * 60,
          snoozeButtonLabel: 'スヌーズ',
        }
      : {}),
  };

  if (item.repeatWeekdays.length > 0) {
    await scheduleRepeatingAlarm({
      ...common,
      hour: item.hour,
      minute: item.minute,
      weekdays: [...item.repeatWeekdays].sort((a, b) => a - b),
    });
  } else {
    const date = nextFireDate(item);
    if (date) {
      await scheduleAlarm({ ...common, date });
    }
  }
}

/** アラームを AlarmKit からも消す。 */
export async function removeAlarm(id: string): Promise<void> {
  try {
    await cancelAlarm(id);
  } catch {
    // 既に無い場合は無視
  }
}
