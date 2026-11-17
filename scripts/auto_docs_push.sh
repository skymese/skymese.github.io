#!/usr/bin/env bash
set -euo pipefail

# 自动将 docs 目录的改动提交并推送到远端 main 分支
REPO_ROOT="$(cd "$(dirname "$0")/.." >/dev/null 2>&1; pwd)"
cd "$REPO_ROOT"

LOG="$REPO_ROOT/docs/.auto_docs_push.log"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || true)
if [[ "${BRANCH}" != "main" ]]; then
  echo "[$TIMESTAMP] Not on main (current: ${BRANCH}). Checking out main." | tee -a "$LOG"
  git checkout main 2>&1 | tee -a "$LOG" || { echo "Failed to switch to main" | tee -a "$LOG"; exit 1; }
fi

if ! git status --porcelain docs | grep -q .; then
  echo "[$TIMESTAMP] No changes in docs." | tee -a "$LOG"
  exit 0
fi

# 先添加改动
git add -A docs 2>&1 | tee -a "$LOG"

COMMIT_MSG="Docs auto-update: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
if git diff --cached --quiet; then
  echo "[$TIMESTAMP] No staged changes to commit." | tee -a "$LOG"; exit 0
fi

git commit -m "$COMMIT_MSG" 2>&1 | tee -a "$LOG" || { echo "No changes to commit" | tee -a "$LOG"; exit 0; }

# 推送到远端
git push origin main 2>&1 | tee -a "$LOG" || {
  echo "Push failed. Ensure SSH key is configured for origin." | tee -a "$LOG";
  exit 1;
}

echo "OK: docs pushed" | tee -a "$LOG"
