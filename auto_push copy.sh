#!/bin/zsh
cd "$(dirname "$0")" || exit 1
[ -f .git/index.lock ] && rm -f .git/index.lock
if ! git diff --quiet ; then
  git add -A
  git commit -m "auto: $(date '+%Y-%m-%d %H:%M')"
  git push origin main
fi

