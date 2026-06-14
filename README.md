# Mini Game Hub

Mini Game Hub は、React + TypeScript + Phaser のミニゲーム画面と、Spring Boot + PostgreSQL の運営データ管理 API を組み合わせたローカル実行用ゲームプラットフォームです。

ゲーム本体はシンプルな避けゲームですが、スコア登録、ランキング、プレイ履歴、実績、期間限定イベント、ゲーム設定の管理を DB と REST API で扱うことを重視しています。

## 技術スタック

- Frontend: React, TypeScript, Vite, Phaser, React Router, Unity WebGL iframe integration
- Backend: Java 21, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, JWT, Validation
- DB: PostgreSQL
- Local DB: Docker Compose

## ディレクトリ構成

```text
mini-game-hub/
  backend/              # Spring Boot API
  frontend/             # React + Vite + Phaser
  docker-compose.yml    # PostgreSQL
  README.md
```

## 起動手順

前提:

- Java 21
- Maven 3.9+
- Node.js 20+
- Docker / Docker Compose

### 1. PostgreSQL を起動

```bash
cd mini-game-hub
docker compose up -d
```

DB 接続情報:

- database: `minigamehub`
- user: `minigamehub`
- password: `minigamehub`
- port: `5432`

### 2. バックエンドを起動

```bash
cd mini-game-hub/backend
mvn spring-boot:run
```

API は `http://localhost:8080/api` で起動します。初回起動時に JPA の `ddl-auto: update` でテーブルを作成し、`DataInitializer` が初期データを投入します。

### 3. フロントエンドを起動

```bash
cd mini-game-hub/frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## 初期ユーザー

| role | email | password |
| --- | --- | --- |
| ADMIN | `admin@example.com` | `password` |
| USER | `user@example.com` | `password` |

## 初期データ

- Game: `Dodge Runner` (`PHASER`)
- Game: `No Strike` (`UNITY_WEBGL`, `/unity-games/no-strike/index.html`)
- Game setting: enemy speed, spawn rate, time limit, base score
- Achievements: first play, 10 plays, score 1000, score 5000, ranking first
- Event: `Starter Boost 1.5x`

## スコア保存設計

`scores.score` にはランキングに使う最終スコアを保存します。イベントが開催中の場合、フロントから送られた元スコアに `events.multiplier` を掛けて保存します。

同時に `scores.originalScore` と `scores.eventMultiplier`、適用された `event_id` も保存するため、あとから「元スコア」「倍率」「最終スコア」を確認できます。

## 主要 API

### Auth

| method | path | auth | description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | public | ユーザー登録 |
| POST | `/api/auth/login` | public | ログインして JWT を取得 |
| GET | `/api/auth/me` | USER/ADMIN | ログイン中ユーザー情報 |

### Games / Scores

| method | path | auth | description |
| --- | --- | --- | --- |
| GET | `/api/games` | public | ゲーム一覧 |
| GET | `/api/games/{gameId}/settings` | public | ゲーム設定取得 |
| GET | `/api/games/{gameId}/ranking` | public | 上位 10 件ランキング。既存互換用 |
| GET | `/api/games/{gameSlug}/ranking` | public | ゲーム slug 指定の上位 10 件ランキング |
| POST | `/api/scores` | USER/ADMIN | スコア登録、イベント倍率適用、実績判定。`gameId` または `gameSlug` を指定 |
| GET | `/api/scores/me` | USER/ADMIN | 自分のスコア履歴 |

### User

| method | path | auth | description |
| --- | --- | --- | --- |
| GET | `/api/users/me/dashboard` | USER/ADMIN | マイページ用データ |

### Events

| method | path | auth | description |
| --- | --- | --- | --- |
| GET | `/api/events/current` | public | 現在開催中イベント |

### Admin

| method | path | auth | description |
| --- | --- | --- | --- |
| GET | `/api/admin/game-settings` | ADMIN | ゲーム設定一覧 |
| GET | `/api/admin/games` | ADMIN | ゲーム一覧、slug、gameType、launchPath 確認 |
| GET | `/api/admin/achievements` | ADMIN | 実績一覧、対象ゲーム確認 |
| PUT | `/api/admin/game-settings/{id}` | ADMIN | ゲーム設定更新 |
| GET | `/api/admin/events` | ADMIN | イベント一覧 |
| POST | `/api/admin/events` | ADMIN | イベント作成 |
| PUT | `/api/admin/events/{id}` | ADMIN | イベント更新、有効/無効切り替え |
| GET | `/api/admin/scores` | ADMIN | 最近のスコア一覧 |

## フロントエンド画面

- `/` トップページ: 開催中イベント、ゲーム開始、ランキング導線
- `/register` ユーザー登録
- `/login` ログイン
- `/game` Phaser の避けゲーム、ゲーム終了後のスコア送信
- `/game?game=no-strike` Unity WebGL の No Strike
- `/ranking?game=no-strike` ゲーム別上位 10 件ランキング
- `/mypage` ユーザー情報、最高スコア、プレイ履歴、実績
- `/admin` ADMIN 専用のゲーム設定、イベント、スコア管理

## Unity WebGL ゲーム連携

Unity WebGL ビルドは `frontend/public/unity-games/{gameSlug}/` に配置します。No Strike は以下に配置済みです。

```text
frontend/public/unity-games/no-strike/index.html
frontend/public/unity-games/no-strike/Build/
frontend/public/unity-games/no-strike/TemplateData/
```

Spring Boot の `games` には以下のメタデータを持たせます。

| field | example | description |
| --- | --- | --- |
| `code` / `slug` | `no-strike` | URL とスコア登録で使うゲーム識別子 |
| `gameType` | `UNITY_WEBGL` | `PHASER` または `UNITY_WEBGL` |
| `launchPath` | `/unity-games/no-strike/index.html` | iframe の表示先 |

React は `gameType` が `UNITY_WEBGL` のゲームを iframe で表示します。`launchPath` が未設定の Unity ゲームはゲーム選択リンクに出しません。

### Unity から React へ送るスコア

ゲーム終了時、Unity WebGL iframe から親 React ページへ `postMessage` で以下の JSON を送ります。

```json
{
  "type": "UNITY_GAME_FINISHED",
  "gameSlug": "no-strike",
  "score": 1200,
  "playTimeSeconds": 45
}
```

React 側は `type`、`gameSlug`、`score`、`playTimeSeconds` を検証します。ログイン済みなら JWT 付きで `/api/scores` に送信し、未ログインなら保存せずログイン案内を表示します。

No Strike ではゲームオーバー時に `score = 生存時間(秒) * 100`、`playTimeSeconds = 生存時間(秒の整数部分)` を送信します。

### Unity WebGL 側の JavaScript サンプル

Unity プロジェクトの `Assets/Plugins/WebGL/MiniGameHubBridge.jslib` に以下を追加します。

```js
mergeInto(LibraryManager.library, {
  MiniGameHubSubmitScore: function(score, playTimeSeconds) {
    window.parent.postMessage({
      type: "UNITY_GAME_FINISHED",
      gameSlug: "no-strike",
      score: Number(score),
      playTimeSeconds: Number(playTimeSeconds)
    }, window.location.origin);
  }
});
```

### Unity C# から呼ぶ例

Unity プロジェクトの `Assets/Scripts/MiniGameHubBridge.cs` に以下を追加し、ゲーム終了処理から `MiniGameHubBridge.SubmitScore(score, playTimeSeconds)` を呼びます。

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
        Debug.Log($"MiniGameHub score: {score}, time: {playTimeSeconds}");
#endif
    }
}
```

WebGL ビルド時だけ `DllImport("__Internal")` が有効になるよう、必ず `UNITY_WEBGL && !UNITY_EDITOR` で囲んでください。

No Strike の Unity プロジェクトでは `GameManager.GameOver()` からこのブリッジを呼び出します。

## Unity WebGL ゲーム追加手順

1. Unity の WebGL ビルドを `frontend/public/unity-games/{gameSlug}/` に置きます。
2. `{gameSlug}/index.html` から `Build/` と `TemplateData/` が正しく参照できることを確認します。
3. Unity 側のゲーム終了処理から `UNITY_GAME_FINISHED` message を送ります。
4. `DataInitializer` または管理画面相当の登録処理で、`code/slug`, `name`, `description`, `gameType=UNITY_WEBGL`, `launchPath=/unity-games/{gameSlug}/index.html` を設定します。
5. React のゲーム一覧に表示されること、`/game?game={gameSlug}` で起動できること、`/ranking?game={gameSlug}` でランキングが見られることを確認します。

将来的な slug 例:

- `glico-fighter`
- `shikoku-rush`
- `doodle-jump`

ただし実ファイルが存在しないゲームは `launchPath` を設定せず、画面にリンクを出さない運用にしてください。

## ゲーム別ランキング API

```http
GET /api/games/no-strike/ranking
```

レスポンス例:

```json
[
  {
    "rank": 1,
    "username": "player",
    "score": 1800,
    "playTimeSeconds": 60,
    "createdAt": "2026-06-14T12:00:00Z",
    "gameName": "No Strike",
    "gameSlug": "no-strike"
  }
]
```

ランキングはスコア降順、同点の場合は作成日時昇順で上位 10 件です。既存互換のため `/api/games/{gameId}/ranking` も利用できます。

## ゲーム別実績

`achievements.game_id` が `null` の実績は全ゲーム共通です。`game_id` が設定されている実績は、そのゲームのスコア登録時だけ判定されます。

No Strike には以下の実績を初期投入します。

- `NO_STRIKE_FIRST_PLAY`: No Strike 初プレイ
- `NO_STRIKE_SCORE_1000`: No Strike でスコア 1000 点突破
- `NO_STRIKE_SCORE_3000`: No Strike でスコア 3000 点突破
- `NO_STRIKE_SURVIVE_60`: No Strike で 60 秒以上生存

## Unity 連携の動作確認

1. PostgreSQL、Spring Boot、React を起動します。
2. `user@example.com` / `password` でログインします。
3. `/game?game=no-strike` を開き、No Strike が iframe 内で表示されることを確認します。
4. No Strike でゲームオーバーになると、Unity 側から `UNITY_GAME_FINISHED` が送られ、ログイン済みユーザーのスコアが自動登録されます。
5. `/ranking?game=no-strike` にスコアが表示されることを確認します。
6. `/mypage` の Play History に No Strike が表示され、条件を満たした No Strike 実績が表示されることを確認します。

## 今後追加できる機能

- 複数ゲームの追加とゲーム別ランキング期間
- イベント別ランキング
- 実績条件の管理画面化
- スコア不正対策の強化
- リプレイ ID やゲームセッション ID の導入
- 管理画面の検索、ページング、監査ログ

## ポートフォリオで説明する際のポイント

- ミニゲーム単体ではなく、運営に必要な DB/API/管理画面を含むプラットフォームとして設計している
- JWT、BCrypt、Role による USER/ADMIN 分離を実装している
- スコア登録時にイベント倍率と実績判定をサービス層で処理している
- ゲーム難易度を DB の `game_settings` から取得し、管理画面の変更がゲーム開始時に反映される
- `Controller -> Service -> Repository -> Entity` の責務分離で、ビジネスロジックを Controller に寄せすぎない構成にしている
