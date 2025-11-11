#!/bin/bash

# Script to upload all project files to GitHub
# This uses GitHub API to push files directly

REPO="Muzaffarfsd/telegram-mini-app-showcase"
BRANCH="main"

echo "🚀 Uploading Telegram Mini App to GitHub..."
echo "Repository: $REPO"
echo ""

# Upload client/index.html first (most important)
echo "📤 Uploading client/index.html..."
CONTENT=$(base64 -w 0 client/index.html)
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Add client/index.html\",\"content\":\"$CONTENT\",\"branch\":\"$BRANCH\"}" \
  "https://api.github.com/repos/$REPO/contents/client/index.html" \
  2>&1 | grep -E '(message|name|path)' | head -5

echo ""
echo "✅ Key file uploaded!"
echo ""
echo "⚠️  Для загрузки всех остальных файлов используйте архив telegram-miniapp-fixed.tar.gz"
echo "   или загрузите файлы через GitHub Web UI"
