// expo-modules-jsi の Swift 6 データレースエラー回避のためのローカル config plugin。
// Xcode 26 の Swift 6 モードでは expo-modules-jsi の
// JavaScriptObject.swift:946 'sending slot risks causing data races' が
// エラーになり xcodebuild が exit code 65 で失敗する。
// xcodebuild に SWIFT_VERSION=5.0 を渡すだけでは Pod ターゲットに反映されず
// 同じエラーで失敗したため（run 42284284099）、Podfile の post_install で
// 全 Pod ターゲットの SWIFT_VERSION を 5.0 にする。
// Swift 5 モードでは同チェックは警告に留まる。iOS 26 SDK 自体は Xcode 26
// から使うため AlarmKit の要件は満たす。
const { withPodfile } = require('expo/config-plugins');

const SWIFT_VERSION_SETTING = `    # expo-modules-jsi を Swift 5 言語モードでビルドする。
    # (xcodebuild への SWIFT_VERSION=5.0 指定だけでは Pod に反映されなかった)
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_VERSION'] = '5.0'
      end
    end
`;

function withSwift5Pods(config) {
  return withPodfile(config, (config) => {
    const contents = config.modResults.contents;
    if (contents.includes("config.build_settings['SWIFT_VERSION'] = '5.0'")) {
      return config;
    }
    // react_native_post_install の呼び出しの直後に差し込む。
    // (react_native_post_install 側の設定より後勝ちにするため)
    const anchor = '      :ccache_enabled => ccache_enabled?(podfile_properties),\n    )';
    if (!contents.includes(anchor)) {
      throw new Error(
        'withSwift5Pods: Podfile の post_install に想定した記述が見つかりませんでした。'
      );
    }
    config.modResults.contents = contents.replace(
      anchor,
      anchor + '\n' + SWIFT_VERSION_SETTING
    );
    return config;
  });
}

module.exports = withSwift5Pods;
