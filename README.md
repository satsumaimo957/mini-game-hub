# Mini Game Hub

Mini Game Hub は、React + TypeScript のフロントエンドと Spring Boot + PostgreSQL のバックエンドで作った、ローカル実行用のミニゲームプラットフォームです。

ゲームを遊ぶだけでなく、ログイン、JWT 認証、スコア保存、ゲーム別ランキング、マイページ、実績、期間限定イベント、管理画面までをまとめて扱います。

## 公開URL

AWS Amplify Hosting で公開しています。

https://feature-aws-deployment.d2nenkg5oxx6z6.amplifyapp.com/

現在は次のゲームに対応しています。

| ゲーム | 種類 | slug | 起動方法 |
| --- | --- | --- | --- |
| ドッジランナー | Phaser | `dodge-runner` | React 内で Phaser を起動 |
| No Strike | Unity WebGL | `no-strike` | iframe で Unity WebGL を表示 |
| Shikoku Rush | Unity WebGL | `shikoku-rush` | iframe で Unity WebGL を表示 |

## 技術スタック

| 領域 | 使用技術 |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Phaser |
| Unity 連携 | Unity WebGL, iframe, `window.postMessage` |
| Backend | Java 21, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security |
| 認証 | JWT, BCrypt |
| DB | PostgreSQL |
| ローカル DB | Docker Compose |
| AWS | Amplify Hosting, Elastic Beanstalk, API Gateway, RDS for PostgreSQL |

## ディレクトリ構成

```text
mini-game-hub/
  backend/                         # Spring Boot API
  frontend/                        # React + Vite + Phaser
    public/
      unity-games/
        no-strike/                 # No Strike の Unity WebGL ビルド
        shikoku-rush/              # Shikoku Rush の Unity WebGL ビルド
  docker-compose.yml               # PostgreSQL
  README.md
```

## 起動手順

必要なもの:

- Java 21
- Maven 3.9 以上
- Node.js 20 以上
- Docker / Docker Compose

### 1. PostgreSQL を起動する

プロジェクト直下で実行します。

```bash
cd mini-game-hub
docker compose up -d
```

DB 接続情報:

| 項目 | 値 |
| --- | --- |
| database | `minigamehub` |
| user | `minigamehub` |
| password | `minigamehub` |
| port | `5432` |

停止するとき:

```bash
cd mini-game-hub
docker compose down
```

### 2. Spring Boot を起動する

別のターミナルを開いて実行します。

```bash
cd mini-game-hub/backend
mvn spring-boot:run
```

バックエンドは `http://localhost:8080/api` で起動します。

初回起動時は `spring.jpa.hibernate.ddl-auto=update` によりテーブルが作られ、`DataInitializer` が初期データを投入します。

### 3. React を起動する

さらに別のターミナルを開いて実行します。

```bash
cd mini-game-hub/frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## 初期ユーザー

| 権限 | email | password | 用途 |
| --- | --- | --- | --- |
| ADMIN | `admin@example.com` | `password` | 管理画面の確認 |
| USER | `user@example.com` | `password` | 通常プレイの確認 |

## 画面一覧

| URL | 内容 |
| --- | --- |
| `/` | トップページ |
| `/register` | ユーザー登録 |
| `/login` | ログイン |
| `/game` | ゲーム画面。標準ではドッジランナー |
| `/game?game=dodge-runner` | ドッジランナー |
| `/game?game=no-strike` | No Strike |
| `/game?game=shikoku-rush` | Shikoku Rush |
| `/ranking` | ランキング |
| `/ranking?game=no-strike` | No Strike のゲーム別ランキング |
| `/ranking?game=shikoku-rush` | Shikoku Rush のゲーム別ランキング |
| `/mypage` | ユーザー情報、プレイ履歴、実績 |
| `/admin` | ADMIN 専用の管理画面 |

## 初期データ

### ゲーム

| name | slug | gameType | launchPath |
| --- | --- | --- | --- |
| ドッジランナー | `dodge-runner` | `PHASER` | なし |
| No Strike | `no-strike` | `UNITY_WEBGL` | `/unity-games/no-strike/index.html` |
| Shikoku Rush | `shikoku-rush` | `UNITY_WEBGL` | `/unity-games/shikoku-rush/index.html` |

`gameType` が `PHASER` のゲームは React 内で Phaser コンポーネントを表示します。

`gameType` が `UNITY_WEBGL` のゲームは `launchPath` を iframe で表示します。Unity WebGL の実ファイルが存在しないゲームは `launchPath` を設定しない運用にしてください。画面側でも、起動できない Unity ゲームへのリンクは出さない前提です。

### イベント

初期状態では `スタートダッシュ 1.5x` というサンプルイベントが有効です。

イベント期間中にスコア登録すると、送信された元スコアにイベント倍率がかかり、ランキング用の最終スコアとして保存されます。

## ゲーム説明

### ドッジランナー

落ちてくるブロックを避け続けろ！

`ドッジランナー` は、アリーナ内を移動しながら上から落ちてくるブロックを避け、制限時間内でできるだけ長く生き残るミニゲームです。

ゲーム開始前にはスタート画面が表示され、終了後はリザルト画面からスコアを登録できます。登録したスコアはランキング、マイページのプレイ履歴、実績に反映されます。

操作:

- `←` / `→` キー: 左右に移動
- `↑` / `↓` キー: 上下に移動
- `W` / `A` / `S` / `D` キー: 上下左右に移動
- マウスクリック: ボタンを押す

### No Strike

最後の 1 ピンになってボールを避け続けろ！

左右移動だけのシンプル操作で、迫り来るボールを回避するアクションゲームです。時間経過でボールは速くなり、カーブし、数も増加します。

どこまで耐えられるか挑戦しよう！

操作:

- `←` / `→` キー: ピンを左右に移動
- マウスクリック: ボタンを押す

### Shikoku Rush

四国がオーストラリアになりすまそうとしている…？

`Shikoku Rush` は、表示される図形の中から四国を見つけ出し、選び続けるカジュアルゲームです。制限時間内にどれだけ正解できるかに挑戦します。

似た形や回転した図形に惑わされず、正しく見極められるかがカギです。観察力が試されます。

操作:

- マウスクリック: 四国だと思う図形を選択

## スコア保存の考え方

スコア登録 API は、`gameId` または `gameSlug` でゲームを特定できます。

Unity WebGL ゲームからは `gameSlug` を使って登録します。

```json
{
  "gameSlug": "shikoku-rush",
  "score": 2500,
  "playTimeSeconds": 64
}
```

保存時には次の値を保持します。

| カラム | 内容 |
| --- | --- |
| `scores.original_score` | フロントエンドまたは Unity から送られた元スコア |
| `scores.event_multiplier` | 適用されたイベント倍率 |
| `scores.score` | ランキングに使う最終スコア |
| `scores.play_time_seconds` | プレイ時間 |
| `scores.game_id` | 対象ゲーム |
| `scores.user_id` | ログイン中ユーザー |
| `scores.event_id` | 適用されたイベント。なければ `null` |

スコア登録後、条件を満たした新しい実績があれば、レスポンスに含まれます。

## 主要 API

### Auth

| method | path | auth | 内容 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | ユーザー登録 |
| POST | `/api/auth/login` | public | ログインして JWT を取得 |
| GET | `/api/auth/me` | USER / ADMIN | ログイン中ユーザー情報 |

### Games / Scores

| method | path | auth | 内容 |
| --- | --- | --- | --- |
| GET | `/api/games` | public | ゲーム一覧 |
| GET | `/api/games/{gameId}/settings` | public | ゲーム設定取得 |
| GET | `/api/games/{gameId}/ranking` | public | ゲーム ID 指定のランキング。既存互換用 |
| GET | `/api/games/{gameSlug}/ranking` | public | game slug 指定のゲーム別ランキング |
| POST | `/api/scores` | USER / ADMIN | スコア登録、イベント倍率適用、実績判定 |
| GET | `/api/scores/me` | USER / ADMIN | 自分のスコア履歴 |

ランキング API のレスポンス例:

```json
[
  {
    "rank": 1,
    "username": "player",
    "score": 2500,
    "playTimeSeconds": 64,
    "createdAt": "2026-06-15T00:00:00Z",
    "gameName": "Shikoku Rush",
    "gameSlug": "shikoku-rush"
  }
]
```

ランキングはスコア降順です。同点の場合は作成日時が古いスコアを上位にします。返す件数は上位 10 件です。

### User

| method | path | auth | 内容 |
| --- | --- | --- | --- |
| GET | `/api/users/me/dashboard` | USER / ADMIN | マイページ用データ |

### Events

| method | path | auth | 内容 |
| --- | --- | --- | --- |
| GET | `/api/events/current` | public | 現在開催中イベント |

### Admin

| method | path | auth | 内容 |
| --- | --- | --- | --- |
| GET | `/api/admin/games` | ADMIN | ゲーム一覧、slug、gameType、launchPath 確認 |
| GET | `/api/admin/game-settings` | ADMIN | ゲーム設定一覧 |
| PUT | `/api/admin/game-settings/{id}` | ADMIN | ゲーム設定更新 |
| GET | `/api/admin/achievements` | ADMIN | 実績一覧、対象ゲーム確認 |
| GET | `/api/admin/events` | ADMIN | イベント一覧 |
| POST | `/api/admin/events` | ADMIN | イベント作成 |
| PUT | `/api/admin/events/{id}` | ADMIN | イベント更新、有効/無効切り替え |
| GET | `/api/admin/scores` | ADMIN | 最近のスコア一覧 |

## Unity WebGL 連携

Unity WebGL ビルドは `frontend/public/unity-games/{gameSlug}/` に配置します。

現在の配置:

```text
frontend/public/unity-games/no-strike/
  index.html
  Build/
  TemplateData/

frontend/public/unity-games/shikoku-rush/
  index.html
  Build/
  TemplateData/
```

React は Unity WebGL ゲームを iframe で表示します。Unity 側はゲーム終了時に `window.parent.postMessage` で親の React ページへスコアを送ります。

### Unity から送る message 形式

No Strike:

```json
{
  "type": "UNITY_GAME_FINISHED",
  "gameSlug": "no-strike",
  "score": 1200,
  "playTimeSeconds": 45
}
```

Shikoku Rush:

```json
{
  "type": "UNITY_GAME_FINISHED",
  "gameSlug": "shikoku-rush",
  "score": 2500,
  "playTimeSeconds": 64
}
```

React 側は次の条件を満たす message だけを処理します。

- `origin` が Mini Game Hub と同じ
- `type` が `UNITY_GAME_FINISHED`
- `gameSlug` が表示中のゲームと一致する
- `score` が 0 以上の数値
- `playTimeSeconds` が 0 以上の数値

未ログインの場合はスコア登録せず、ログイン案内を表示します。ログイン済みの場合は JWT 付きで `/api/scores` に送信します。

### Unity 側 JavaScript

Unity プロジェクトに `Assets/Plugins/WebGL/MiniGameHubBridge.jslib` を追加します。

`gameSlug` はゲームごとに変更してください。

```js
mergeInto(LibraryManager.library, {
  MiniGameHubSubmitScore: function(score, playTimeSeconds) {
    window.parent.postMessage({
      type: "UNITY_GAME_FINISHED",
      gameSlug: "shikoku-rush",
      score: Number(score),
      playTimeSeconds: Number(playTimeSeconds)
    }, window.location.origin);
  }
});
```

### Unity 側 C#

Unity プロジェクトに `Assets/Scripts/MiniGameHubBridge.cs` を追加します。

```csharp
using System.Runtime.InteropServices;
using UnityEngine;

public static class MiniGameHubBridge
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void MiniGameHubSubmitScore(int score, int playTimeSeconds);
#endif

    public static void SubmitScore(int score, int playTimeSeconds)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        MiniGameHubSubmitScore(score, playTimeSeconds);
#else
        Debug.Log($"MiniGameHub score submit skipped outside WebGL build. score={score}, playTimeSeconds={playTimeSeconds}");
#endif
    }
}
```

ゲーム終了処理またはリザルト画面の表示時に呼びます。

```csharp
MiniGameHubBridge.SubmitScore(score, playTimeSeconds);
```

WebGL ビルド時だけ JavaScript 連携が有効になるよう、`UNITY_WEBGL && !UNITY_EDITOR` の条件を外さないでください。

## Unity WebGL ゲームを追加する手順

例として `glico-fighter` を追加する場合:

1. Unity 側で WebGL ビルドを作成します。
2. ビルド結果を `frontend/public/unity-games/glico-fighter/` に置きます。
3. `frontend/public/unity-games/glico-fighter/index.html` が存在することを確認します。
4. Unity 側に `MiniGameHubBridge.jslib` と `MiniGameHubBridge.cs` を追加します。
5. `.jslib` の `gameSlug` を `glico-fighter` にします。
6. ゲーム終了処理から `MiniGameHubBridge.SubmitScore(score, playTimeSeconds)` を呼びます。
7. Spring Boot の初期データ、または管理画面相当の登録処理でゲームを追加します。

登録するゲーム情報の例:

| field | value |
| --- | --- |
| `code` / `slug` | `glico-fighter` |
| `name` | `Glico Fighter` |
| `description` | ゲーム説明 |
| `gameType` | `UNITY_WEBGL` |
| `launchPath` | `/unity-games/glico-fighter/index.html` |
| `active` | `true` |

追加後に確認する URL:

```text
http://localhost:5173/game?game=glico-fighter
http://localhost:5173/ranking?game=glico-fighter
```

実ファイルがまだ存在しないゲームは、画面にリンクを出さないようにしてください。将来的な slug の候補としては `glico-fighter`、`doodle-jump` などを想定できます。

## 実績

`achievements.game_id` が `null` の実績は全ゲーム共通です。

`achievements.game_id` が設定されている実績は、そのゲームのスコア登録時だけ判定されます。

### 全ゲーム共通

| code | 条件 |
| --- | --- |
| `FIRST_PLAY` | 初めてスコアを登録 |
| `PLAY_10` | スコアを 10 回登録 |
| `SCORE_1000` | スコア 1000 点以上 |
| `SCORE_5000` | スコア 5000 点以上 |
| `RANKING_FIRST` | ゲーム別ランキング 1 位 |

### No Strike

| code | 条件 |
| --- | --- |
| `NO_STRIKE_FIRST_PLAY` | No Strike 初プレイ |
| `NO_STRIKE_SCORE_1000` | No Strike でスコア 1000 点以上 |
| `NO_STRIKE_SCORE_3000` | No Strike でスコア 3000 点以上 |
| `NO_STRIKE_SURVIVE_60` | No Strike で 60 秒以上生存 |

### Shikoku Rush

| code | 条件 |
| --- | --- |
| `SHIKOKU_RUSH_FIRST_PLAY` | Shikoku Rush 初プレイ |
| `SHIKOKU_RUSH_SCORE_1000` | Shikoku Rush でスコア 1000 点以上 |
| `SHIKOKU_RUSH_SCORE_3000` | Shikoku Rush でスコア 3000 点以上 |
| `SHIKOKU_RUSH_SCORE_5000` | Shikoku Rush でスコア 5000 点以上 |
| `SHIKOKU_RUSH_SURVIVE_60` | Shikoku Rush で 60 秒以上プレイ |

獲得済み実績は `user_achievements` に保存されます。同じユーザーが同じ実績を重複獲得しないよう、`user_id` と `achievement_id` の組み合わせを一意にしています。

## 動作確認手順

### 基本確認

1. PostgreSQL、Spring Boot、React を起動します。
2. `http://localhost:5173` を開きます。
3. `user@example.com` / `password` でログインします。
4. `/game?game=dodge-runner` を開き、スタート画面からゲームを開始できることを確認します。
5. ゲーム終了後、リザルト画面からスコア登録できることを確認します。
6. `/ranking?game=dodge-runner` にスコアが表示されることを確認します。
7. `/mypage` にプレイ履歴と実績が表示されることを確認します。

### No Strike

1. `/game?game=no-strike` を開きます。
2. No Strike が画面内の iframe で表示されることを確認します。
3. ゲームオーバーまでプレイします。
4. 画面に `スコアを登録しました` と表示されることを確認します。
5. `/ranking?game=no-strike` にスコアが表示されることを確認します。
6. `/mypage` のプレイ履歴と実績に No Strike の結果が表示されることを確認します。

### Shikoku Rush

1. `/game?game=shikoku-rush` を開きます。
2. Shikoku Rush が画面内の iframe で表示されることを確認します。
3. ゲームを終了またはクリアします。
4. 画面に `スコアを登録しました` と表示されることを確認します。
5. `/ranking?game=shikoku-rush` にスコアが表示されることを確認します。
6. `/mypage` のプレイ履歴と実績に Shikoku Rush の結果が表示されることを確認します。

### 管理画面

1. `admin@example.com` / `password` でログインします。
2. `/admin` を開きます。
3. ゲーム一覧に `ドッジランナー`、`No Strike`、`Shikoku Rush` が表示されることを確認します。
4. 各ゲームの `slug`、`gameType`、`launchPath`、ランキングリンクを確認します。
5. 実績一覧で、全ゲーム共通実績とゲーム別実績が表示されることを確認します。

## 開発用の確認

開発モードでは、Unity ゲーム画面に `テスト用スコア送信` ボタンが表示されます。

これは Unity 側のゲーム終了処理を待たずに、React からスコア登録 API までの流れを確認するためのものです。本番 UI として使うためのボタンではありません。

目安のテストスコア:

| gameSlug | score | playTimeSeconds |
| --- | --- | --- |
| `no-strike` | `1200` | `45` |
| `shikoku-rush` | `2500` | `64` |

## テストとビルド

バックエンドのテスト:

```bash
cd mini-game-hub/backend
mvn test
```

フロントエンドのビルド:

```bash
cd mini-game-hub/frontend
npm run build
```

## AWS デプロイ準備

AWS では次の構成を想定しています。

| 領域 | AWS サービス | 役割 |
| --- | --- | --- |
| Frontend | AWS Amplify Hosting | React + Vite の静的ファイル配信 |
| Backend | AWS Elastic Beanstalk | Spring Boot JAR の実行 |
| HTTPS API | Amazon API Gateway | HTTPS の API 入口。Amplify からの API 通信を受け、Elastic Beanstalk へ転送 |
| Database | Amazon RDS for PostgreSQL | 本番データベース |

このリポジトリには、AWSへ直接デプロイする前の下準備として、本番用プロファイルと環境変数の受け口を用意しています。ローカル起動はこれまで通り使えます。

本番では、ブラウザからは Amplify の HTTPS ページを開き、API 通信は API Gateway の HTTPS URL に送ります。API Gateway から Elastic Beanstalk の Spring Boot API へ転送し、Spring Boot は RDS for PostgreSQL に接続します。

```text
Browser
  -> AWS Amplify Hosting
  -> Amazon API Gateway
  -> AWS Elastic Beanstalk
  -> Amazon RDS for PostgreSQL
```

この構成にすることで、Amplify の HTTPS ページから HTTP の API を直接呼んで発生する Mixed Content を避けられます。

### AWS 対応の工夫点

- React / Vite の API 接続先は `VITE_API_BASE_URL` で切り替えます。
- ローカルでは `http://localhost:8080/api`、AWS では API Gateway の HTTPS URL を使います。
- Spring Boot は `prod` プロファイルで起動し、RDS の接続情報を環境変数から読みます。
- API Gateway を HTTPS の入口にして、Amplify からの Mixed Content を回避します。
- CORS 設定は `CORS_ALLOWED_ORIGIN` で切り替え、Amplify からのアクセスだけを許可します。
- Unity WebGL は Amplify 配信に合わせて、圧縮なしの WebGL ビルドを配置する運用にします。

### 秘密情報の扱い

DB パスワード、JWT の秘密鍵、AWS の接続情報などは GitHub にコミットしないでください。

実際の値は、Elastic Beanstalk の環境プロパティ、Amplify の環境変数、またはローカルの `.env` で管理します。

このリポジトリに入れてよいのは、値の見本だけを書いた `.env.example` です。

### Backend の環境変数

Elastic Beanstalk では次の環境変数を設定します。

| 変数 | 例 | 内容 |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring Boot の本番プロファイル |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://xxxxx.rds.amazonaws.com:5432/minigamehub` | RDS PostgreSQL の JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `minigamehub` | DB ユーザー名 |
| `SPRING_DATASOURCE_PASSWORD` | `********` | DB パスワード |
| `JWT_SECRET` | `long-random-secret-value` | JWT 署名用の秘密鍵 |
| `JWT_EXPIRATION_MINUTES` | `1440` | JWT の有効期限。省略可 |
| `CORS_ALLOWED_ORIGIN` | `https://main.xxxxx.amplifyapp.com` | Amplify のフロントエンド URL |
| `HIBERNATE_DDL_AUTO` | `update` | Hibernate の DDL 自動更新設定 |
| `PORT` | `5000` | Elastic Beanstalk がアプリへ渡すポート。省略可 |

`backend/src/main/resources/application.yml` はローカル向けのデフォルト値を持っています。

`backend/src/main/resources/application-prod.yml` は AWS 本番向けです。本番では `SPRING_DATASOURCE_URL`、`SPRING_DATASOURCE_USERNAME`、`SPRING_DATASOURCE_PASSWORD`、`JWT_SECRET`、`CORS_ALLOWED_ORIGIN` を必ず環境変数で渡してください。

### ddl-auto の注意

現在、本番用プロファイルでも `HIBERNATE_DDL_AUTO` の標準値は `update` です。これは MVP や個人開発の初期デプロイでは便利ですが、本番運用では意図しないスキーマ変更のリスクがあります。

公開後にデータを大切に扱う段階では、Flyway や Liquibase のようなマイグレーション管理に移行し、`HIBERNATE_DDL_AUTO=validate` などへ変更することを検討してください。

### Elastic Beanstalk 用バックエンドビルド

ローカルで JAR を作成します。

```bash
cd mini-game-hub/backend
mvn clean package
```

作成される JAR:

```text
backend/target/mini-game-hub-0.0.1-SNAPSHOT.jar
```

`backend/Procfile` では次のコマンドで起動するようにしています。

```text
web: java -jar target/mini-game-hub-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

Elastic Beanstalk へアップロードする場合は、`backend/` をデプロイ単位にし、`Procfile` と `target/mini-game-hub-0.0.1-SNAPSHOT.jar` が含まれるようにしてください。

### Frontend の環境変数

Amplify Hosting では次の環境変数を設定します。

| 変数 | 例 | 内容 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/api` | API Gateway の HTTPS API URL |

ローカルでは未設定でも `http://localhost:8080/api` を使います。

以前の `VITE_API_URL` も後方互換として残していますが、今後は `VITE_API_BASE_URL` を使ってください。

Amplify から Elastic Beanstalk の HTTP URL を直接呼ぶと、ブラウザで Mixed Content としてブロックされることがあります。そのため、本番では `VITE_API_BASE_URL` に API Gateway の HTTPS URL を設定します。

### Amplify Hosting 用フロントエンドビルド

ローカルで確認する場合:

```bash
cd mini-game-hub/frontend
npm install
npm run build
```

Amplify のビルド設定では、アプリのルートを `frontend` にし、ビルドコマンドを `npm run build`、出力ディレクトリを `dist` にします。

Amplify で `VITE_API_BASE_URL` を設定したあとにビルドすると、React アプリはその URL に API リクエストを送ります。

Unity WebGL ファイルは `frontend/public/unity-games/` 配下に置かれているため、Vite のビルド時に静的ファイルとして `dist/unity-games/` にコピーされます。

### Unity WebGL の Amplify 配信

Unity WebGL は、Amplify の静的ファイル配信でそのまま読めるように、圧縮なしでビルドしたファイルを `frontend/public/unity-games/{gameSlug}/` に配置します。

圧縮済みの `.gz` や `.br` を使う場合は、配信側で `Content-Encoding` を正しく返す設定が必要です。設定が合わないと Unity の loader がファイルを読めず、ゲームが起動しないことがあります。

このプロジェクトでは、Amplify での扱いやすさを優先し、Unity WebGL は圧縮なしビルドを置く方針です。

確認するファイル例:

```text
frontend/public/unity-games/no-strike/index.html
frontend/public/unity-games/no-strike/Build/

frontend/public/unity-games/shikoku-rush/index.html
frontend/public/unity-games/shikoku-rush/Build/
```

AWS 反映後は、Amplify の URL から `/unity-games/no-strike/index.html` や `/unity-games/shikoku-rush/index.html` が表示できることを確認します。

### AWS 本番確認チェック

1. Amplify の環境変数 `VITE_API_BASE_URL` が API Gateway の HTTPS URL になっていることを確認します。
2. Elastic Beanstalk の環境変数 `SPRING_PROFILES_ACTIVE=prod` を確認します。
3. Elastic Beanstalk の `SPRING_DATASOURCE_URL` が RDS PostgreSQL を向いていることを確認します。
4. Elastic Beanstalk の `CORS_ALLOWED_ORIGIN` が Amplify の URL と一致していることを確認します。
5. Amplify の画面からログインできることを確認します。
6. No Strike / Shikoku Rush を起動し、Unity WebGL が iframe 内で表示されることを確認します。
7. ゲーム終了時にスコアが登録され、ランキングとマイページに反映されることを確認します。
8. ブラウザの Console に Mixed Content や CORS エラーが出ていないことを確認します。

### AWS 利用時の課金注意

AWS の RDS、Elastic Beanstalk、Amplify は無料枠を超えると料金が発生します。

特に RDS は起動している時間、ストレージ、バックアップ、データ転送で課金される可能性があります。検証が終わった環境は停止または削除してください。

## よくあるトラブル

### React 画面が API に接続できない

Spring Boot が `http://localhost:8080` で起動しているか確認してください。

また、`backend/src/main/resources/application.yml` の CORS 設定は標準で `http://localhost:5173` を許可しています。Vite のポートを変えた場合は、`CORS_ALLOWED_ORIGIN` も合わせて変更してください。

AWS 本番では、Amplify 側の `VITE_API_BASE_URL` が API Gateway の HTTPS URL になっているか、Elastic Beanstalk 側の `CORS_ALLOWED_ORIGIN` が Amplify の URL になっているかを確認してください。

### AWS 本番で Mixed Content エラーが出る

Amplify の画面は HTTPS で配信されるため、HTTP の Elastic Beanstalk URL を直接呼ぶとブラウザにブロックされます。

`VITE_API_BASE_URL` には Elastic Beanstalk の HTTP URL ではなく、API Gateway の HTTPS URL を設定してください。

### AWS 本番で CORS エラーが出る

Elastic Beanstalk の `CORS_ALLOWED_ORIGIN` を、実際にブラウザで開いている Amplify の URL と完全一致させてください。

末尾スラッシュの有無や、`https://` の付け忘れでも一致しないことがあります。

### Unity ゲームを直接開くとスコア登録されない

Unity の `index.html` を直接開いた場合、親の React ページが存在しないため、Mini Game Hub が `postMessage` を受け取れません。

必ず Mini Game Hub の画面から開いてください。

```text
http://localhost:5173/game?game=no-strike
http://localhost:5173/game?game=shikoku-rush
```

### Unity 側でビルドしたのにスコアが送られない

次を確認してください。

- Unity プロジェクトに `Assets/Plugins/WebGL/MiniGameHubBridge.jslib` がある
- Unity プロジェクトに `Assets/Scripts/MiniGameHubBridge.cs` がある
- ゲーム終了処理で `MiniGameHubBridge.SubmitScore(score, playTimeSeconds)` を呼んでいる
- `.jslib` の `gameSlug` が Mini Game Hub 側の slug と一致している
- WebGL ビルドを `frontend/public/unity-games/{gameSlug}/` に置き直している
- ブラウザを強制更新している

### DB を初期化して最初から確認したい

保存済みデータを消して初期状態に戻す場合:

```bash
cd mini-game-hub
docker compose down -v
docker compose up -d
```

その後、Spring Boot を起動し直すと初期データが再投入されます。
