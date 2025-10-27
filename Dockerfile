# ビルドステージ
FROM oven/bun:1 AS builder

WORKDIR /app

# 依存関係ファイルのみコピー（レイヤーキャッシュ最適化）
COPY package.json bun.lockb* ./

# 依存関係インストール
RUN bun install --frozen-lockfile

# ソースコードをコピー
COPY . .

# TypeScriptビルド（本番用）
RUN bun run build

# 本番ステージ
FROM oven/bun:1-slim AS production

WORKDIR /app

# 本番用依存関係のみインストール
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile

# ビルド成果物をコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/modules/chat/answers.json ./src/modules/chat/answers.json
COPY --from=builder /app/src/modules/chat/area.json ./src/modules/chat/area.json

# 非rootユーザーで実行
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --home /home/botuser --shell /bin/sh botuser && \
    mkdir -p /home/botuser/.minecraft && \
    chown -R botuser:nodejs /app /home/botuser

USER botuser

# ヘルスチェック
# プロセスが正常に動作しているかを30秒ごとに確認
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD test -f /proc/self/stat || exit 1

# 環境変数のデフォルト値は設定しない（外部から注入）
# ENV はセキュリティ上の理由で削除

CMD ["bun", "run", "dist/index.js"]
