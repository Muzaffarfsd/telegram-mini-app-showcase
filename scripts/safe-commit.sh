#!/usr/bin/env bash
# safe-commit.sh — commit ONLY explicit paths and abort if the index is poisoned.
#
# Reason: this repo lives on a Windows mount where .git/index corrupts often
# (`bad signature 0x00000000`) and stat-cache lies cause `git add -A` /
# `git reset --mixed HEAD` to stage thousands of phantom deletions.  Real
# example: commit 764adda deleted 964 files (tsconfig.json, vite.config.ts,
# tailwind.config.ts) and broke the Railway build.
#
# Usage:
#   bash scripts/safe-commit.sh -m "commit message" path/to/file1 path/to/file2
#
# What it does:
#   1. Verifies .git/index is healthy (rebuilds via read-tree if corrupt).
#   2. Stages ONLY the explicit paths you listed.
#   3. Compares the staged file count to the count of paths you passed.
#      If they differ — refuses to commit.
#   4. Commits with the message you provided.
#   5. Prints `git show --stat HEAD | head -20` for visual verification
#      BEFORE you push.
#
# Push step is intentionally NOT done here — verify the stat output first.

set -euo pipefail

MSG=""
PATHS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m|--message) MSG="$2"; shift 2 ;;
    *)            PATHS+=("$1"); shift ;;
  esac
done

if [[ -z "$MSG" ]]; then
  echo "ERROR: -m <message> is required" >&2; exit 2
fi
if [[ ${#PATHS[@]} -eq 0 ]]; then
  echo "ERROR: must list at least one explicit path to commit" >&2; exit 2
fi

# 1. Health-check the index.  If corrupt, rebuild from HEAD.
if ! git status --porcelain >/dev/null 2>&1; then
  echo "[safe-commit] .git/index corrupt — rebuilding from HEAD"
  rm -f .git/index
  git read-tree HEAD
fi

# 2. Make sure every listed path actually exists and is modified.  Use
#    `touch + update-index --refresh` to defeat stat-cache lies.
for p in "${PATHS[@]}"; do
  if [[ ! -e "$p" ]]; then
    echo "ERROR: path does not exist: $p" >&2; exit 3
  fi
  touch -- "$p"
done
git update-index --refresh -- "${PATHS[@]}" >/dev/null 2>&1 || true

# 3. Stage ONLY the listed paths.  Never -A, never `.`, never bulk.
git add -- "${PATHS[@]}"

# 4. Compare staged-file count to listed-path count.  Refuse on mismatch.
STAGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
WANT=${#PATHS[@]}
echo "[safe-commit] staged: $STAGED  listed: $WANT"
if [[ "$STAGED" -ne "$WANT" ]]; then
  echo "[safe-commit] REFUSING — staged count ($STAGED) != listed count ($WANT)" >&2
  echo "[safe-commit] Likely a poisoned index from a Windows-mount stat issue." >&2
  echo "[safe-commit] Staged files:" >&2
  git diff --cached --name-only | sed 's/^/  /' >&2
  exit 4
fi

# 5. Commit.
git -c user.name="${GIT_AUTHOR_NAME:-Muzaffarfsd}" \
    -c user.email="${GIT_AUTHOR_EMAIL:-mmuzaparov5@gmail.com}" \
    commit -m "$MSG"

# 6. Show what we just wrote.  Caller must read this before pushing.
echo ""
echo "[safe-commit] === verify before push ==="
git show --stat HEAD | head -20
echo ""
echo "[safe-commit] If the file list above looks right, push with:"
echo "  git push origin HEAD:main 2>&1 | sed -E 's#https://[^@ ]*@#https://***TOKEN***@#g'"
