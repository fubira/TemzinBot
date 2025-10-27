# Docker使用ガイド

## 概要

TemzinBotはDockerコンテナ内で本番環境として実行可能です。

**開発環境**: ローカルで`bun run dev`を使用してください。Dockerは本番環境・デプロイ用です。

## 前提条件

- Docker 20.10以上
- Docker Compose 2.0以上

## クイックスタート

### 1. 環境変数の設定

```bash
cp .env.example .env
```

`.env`ファイルを編集し、必須の環境変数を設定：

```env
MC_HOST=your-minecraft-server.com
MC_PORT=25565
MC_USERNAME=your-email@example.com
MC_AUTH=microsoft
```

### 2. コンテナ起動

```bash
# ビルドして起動
docker compose up -d

# ログ確認
docker compose logs -f temzinbot

# 停止
docker compose down
```

## Dockerfileの特徴

### マルチステージビルド

- **ビルドステージ**: TypeScriptをコンパイル
- **本番ステージ**: 最小限の依存関係のみ
- 非rootユーザーで実行（セキュリティ）
- イメージサイズ最適化

## ディレクトリ構造

```
TemzinBot/
├── Dockerfile          # 本番用Dockerfile（マルチステージビルド）
├── docker-compose.yml  # Docker Compose設定
├── .dockerignore       # Docker除外ファイル
├── .env.example        # 環境変数サンプル
└── .env                # 実際の環境変数（gitignore）
```

## 環境変数

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `MC_HOST` | Minecraftサーバーのホスト | `localhost` |
| `MC_PORT` | Minecraftサーバーのポート（1-65535） | `25565` |
| `MC_USERNAME` | アカウント名（メールアドレス） | `user@example.com` |

### オプション環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `MC_VERSION` | Minecraftバージョン | `1.21.4` |
| `MC_AUTH` | 認証方式 (`mojang`, `microsoft`, `offline`) | `offline` |
| `CLAUDE3_API_KEY` | Claude 3 APIキー | - |
| `GEMINI_API_KEY` | Gemini APIキー | - |
| `OPENAI_API_KEY` | OpenAI APIキー | - |

詳細は`.env.example`を参照してください。

## ビルドオプション

### キャッシュなしでビルド

```bash
docker compose build --no-cache
```

### 特定のステージのみビルド

```bash
docker build --target builder -t temzinbot:builder .
```

## トラブルシューティング

### 環境変数検証エラー

起動時に以下のエラーが出る場合：

```
Environment variable validation failed:
  - MC_PORT: MC_PORT must be between 1 and 65535
```

→ `.env`ファイルの該当環境変数を修正してください。

### ビルドエラー

```bash
# node_modulesとビルド成果物を削除して再ビルド
docker compose down -v
docker compose build --no-cache
docker compose up
```

### ログ確認

```bash
# リアルタイムログ
docker compose logs -f

# 最新100行
docker compose logs --tail=100
```

## 本番デプロイ

### リソース制限

`docker-compose.yml`で以下のリソース制限を設定済み：

- CPU: 最大1コア、最小0.5コア
- メモリ: 最大512MB、最小256MB

### 再起動ポリシー

デフォルトで`restart: unless-stopped`を設定。

### ログ管理

docker-composeでログ設定をカスタマイズ可能：

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## セキュリティ

- ❌ Dockerfile内にAPIキーをハードコードしない
- ✅ `.env`ファイルで環境変数を管理
- ✅ `.env`は`.gitignore`に含める
- ✅ 非rootユーザーで実行
- ✅ 本番イメージは最小限の依存関係のみ

## ネットワーク設定

Minecraftサーバーが同じDockerネットワーク内にある場合：

```yaml
services:
  temzinbot:
    networks:
      - minecraft-network

networks:
  minecraft-network:
    external: true
```

## ボリュームマウント

### ログの永続化

```yaml
volumes:
  - ./logs:/app/logs
```

### answers.jsonの外部編集

```yaml
volumes:
  - ./src/modules/chat/answers.json:/app/src/modules/chat/answers.json:ro
```

## 更新手順

```bash
# 最新のコードを取得
git pull

# コンテナを停止
docker compose down

# イメージを再ビルド
docker compose build

# 起動
docker compose up -d
```
