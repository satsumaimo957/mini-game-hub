# Mini Game Hub

Mini Game Hub は、React + TypeScript + Phaser のミニゲーム画面と、Spring Boot + PostgreSQL の運営データ管理 API を組み合わせたローカル実行用ゲームプラットフォームです。

ゲーム本体はシンプルな避けゲームですが、スコア登録、ランキング、プレイ履歴、実績、期間限定イベント、ゲーム設定の管理を DB と REST API で扱うことを重視しています。

## 技術スタック

- Frontend: React, TypeScript, Vite, Phaser, React Router
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

- Game: `Dodge Runner`
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
| GET | `/api/games/{gameId}/ranking` | public | 上位 10 件ランキング |
| POST | `/api/scores` | USER/ADMIN | スコア登録、イベント倍率適用、実績判定 |
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
- `/ranking` 上位 10 件ランキング
- `/mypage` ユーザー情報、最高スコア、プレイ履歴、実績
- `/admin` ADMIN 専用のゲーム設定、イベント、スコア管理

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
