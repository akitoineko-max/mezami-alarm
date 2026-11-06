# めざみアラーム（Expo版）

React Native + Expo で作った iOS アラームアプリです。
アラームの実体は **Apple の AlarmKit**（コミュニティ製ラッパー `expo-alarm-kit` 経由）で登録するため、**アプリを閉じていても・サイレントモードでも・集中モードでも、標準の時計アプリと同じように鳴ります**（ローカル通知ではありません）。

## 機能

- アラームの追加・編集・削除、ON/OFF 切り替え
- 繰り返し：1回のみ / 曜日指定（平日・週末・毎日のクイック選択つき）
- ラベル、スヌーズ（なし / 5 / 9 / 10 / 15分）
- 次に鳴るアラームを一覧上部に表示
- 設定は端末内（AsyncStorage）に保存し、AlarmKit へ自動で同期

## 必要な環境

- iPhone：**iOS 26 以上**（AlarmKit の要件）
- ビルド：クラウド（GitHub Actions / EAS）を使うため Mac は不要
- インストール：SideStore（無料署名）を使うため、初回設定用に PC が必要

## 自分の iPhone へ入れる手順（Macなし・無料）

1. **ビルド**
   このフォルダを GitHub リポジトリに push すると、Actions の「Build unsigned IPA」が走り、成果物 `Mezami-unsigned-ipa`（署名なし .ipa）がダウンロードできるようになります。
   ※ GitHub の macOS ランナーは無料枠に上限があります（プライベートリポジトリは月2,000分まで等。macOS は分数の消費が大きいので注意）。
2. **SideStore の初期設定**（初回のみ、PC を使用）
   - [SideStore](https://sidestore.io/) の公式手順に従い、PC から iPhone に SideStore をインストールします（USB 接続とペアリングファイルの作成が必要）。
   - SideStore に自分の Apple ID でサインインします。
3. **アプリのインストール**
   - 手順1の `Mezami-unsigned.ipa` を iPhone に送り、SideStore で開いてインストールします。無料の開発者証明書で署名されます。
4. **署名の更新**
   - 無料証明書は **7日で失効** します。SideStore は同じ Wi-Fi にいるときに自動更新を試みます。失効した場合は SideStore を開いて手動で更新してください（失効中はアラームが鳴らないので注意）。
   - 無料署名で同時に入れられるアプリは最大3つです。

アプリを初めて使うときは、アラーム保存時にシステムの許可ダイアログが出るので「許可」してください。

## 有料ルート（任意）

Apple Developer Program（年 $99）に登録すると、EAS Build（`eas.json` の preview プロファイル）で署名済みビルドが作れ、署名は1年有効になります。7日更新の手間がなくなります。

```bash
npx eas-cli@latest build --platform ios --profile preview
```

## ローカルでの確認（開発用）

```bash
npm install
npx tsc --noEmit        # 型チェック
npx expo-doctor         # プロジェクト診断
npx expo prebuild --platform ios --no-install  # ネイティブ設定の生成確認
```

## 構成

| パス | 内容 |
| --- | --- |
| `src/app/index.tsx` | アラーム一覧画面 |
| `src/app/edit.tsx` | 追加・編集画面 |
| `src/app/_layout.tsx` | ナビゲーション定義 |
| `src/store/AlarmContext.tsx` | 状態管理（保存と AlarmKit 同期） |
| `src/lib/alarmService.ts` | expo-alarm-kit のラッパー |
| `src/lib/types.ts` | データモデルと日時計算 |
| `src/lib/storage.ts` | AsyncStorage への保存 |
| `plugins/withAlarmKitSetup.js` | App Groups・表示名・Info.plist を入れる config plugin |
| `app.json` | Expo 設定（デプロイ対象 iOS 26.0 など） |
| `.github/workflows/build-unsigned-ipa.yml` | 署名なし IPA のクラウドビルド |

## 注意

- `expo-alarm-kit` はコミュニティ製の v0.1.x です。実機で必ず動作確認してください（特にスヌーズと繰り返し）。
- このプロジェクトは Linux 環境で作成し、型チェック・設定生成・expo-doctor までは確認済みです。iOS のコンパイル自体は GitHub Actions 上で初めて走ります。失敗したら Actions のログを見て調整してください。
- アイコンはテンプレートの仮アイコンです。差し替える場合は `assets/icon.png`（1024×1024）を置き換えてください。
