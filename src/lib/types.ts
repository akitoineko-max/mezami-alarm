export interface AlarmItem {
  id: string;
  hour: number;
  minute: number;
  label: string;
  /** 繰り返す曜日。1 = 日曜 … 7 = 土曜。空 = 1回のみ */
  repeatWeekdays: number[];
  isEnabled: boolean;
  /** スヌーズ間隔（分）。0 = スヌーズなし */
  snoozeMinutes: number;
}

export const WEEKDAY_SYMBOLS = ['日', '月', '火', '水', '木', '金', '土'];

export function timeString(item: Pick<AlarmItem, 'hour' | 'minute'>): string {
  return `${item.hour}:${String(item.minute).padStart(2, '0')}`;
}

export function repeatText(item: Pick<AlarmItem, 'repeatWeekdays'>): string {
  const days = [...item.repeatWeekdays].sort((a, b) => a - b);
  if (days.length === 0) return '1回のみ';
  if (days.length === 7) return '毎日';
  if (days.join() === '2,3,4,5,6') return '平日';
  if (days.join() === '1,7') return '週末';
  return days.map((d) => WEEKDAY_SYMBOLS[d - 1]).join(' ');
}

/** 次に鳴る日時。無効なアラームでは null。 */
export function nextFireDate(
  item: Pick<AlarmItem, 'hour' | 'minute' | 'repeatWeekdays' | 'isEnabled'>,
  from: Date = new Date(),
): Date | null {
  if (!item.isEnabled) return null;
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = new Date(from);
    candidate.setDate(from.getDate() + offset);
    candidate.setHours(item.hour, item.minute, 0, 0);
    if (candidate <= from) continue;
    const weekday = candidate.getDay() + 1; // 1 = 日曜
    if (item.repeatWeekdays.length === 0 || item.repeatWeekdays.includes(weekday)) {
      return candidate;
    }
  }
  return null;
}

/** 依存パッケージなしで使える簡易 UUID。 */
export function createId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
