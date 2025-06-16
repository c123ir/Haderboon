#!/bin/zsh
cd "$(dirname "$0")" || exit 1
[ -f .git/index.lock ] && rm -f .git/index.lock

# 1) سینکِ سریع با ریموت (بدون فایل‌های تغییرناپذیر)
git fetch origin main
git rebase --autostash origin/main || {
  echo "⚠️  Rebase failed $(date)" >> /tmp/autopush_haderboon.err
  exit 1
}

# 2) فقط اگر تغییری هست push کن
if ! git diff --quiet ; then
  git add -A
  git commit -m "auto: $(date '+%Y-%m-%d %H:%M')"
  git push origin main
fi
