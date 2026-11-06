// expo-alarm-kit が必要とするネイティブ設定を prebuild 時に自動で入れるための
// ローカル config plugin。
// - App Groups エンタイトルメント（モジュールが共有ストレージに使う）
// - ホーム画面の表示名（日本語）
const { withInfoPlist, withEntitlementsPlist } = require('expo/config-plugins');

const APP_GROUP = 'group.jp.akito.mezami';

function withAlarmKitSetup(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleDisplayName = 'めざみアラーム';
    config.modResults.NSAlarmKitUsageDescription =
      '設定した時刻にアラームを鳴らすために使用します。';
    config.modResults.NSSupportsLiveActivities = true;
    return config;
  });

  config = withEntitlementsPlist(config, (config) => {
    const key = 'com.apple.developer.application-groups';
    const groups = new Set(config.modResults[key] ?? []);
    groups.add(APP_GROUP);
    config.modResults[key] = [...groups];
    return config;
  });

  return config;
}

module.exports = withAlarmKitSetup;
