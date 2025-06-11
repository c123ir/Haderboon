PROJECT="/Users/imac2019/My-Apps/Haderboon" && \
cat > "$PROJECT/auto_push.sh" <<'EOS'
#!/bin/zsh
cd "$(dirname "$0")" || exit 1
[ -f .git/index.lock ] && rm -f .git/index.lock
if ! git diff --quiet ; then
  git add -A
  git commit -m "auto: $(date '+%Y-%m-%d %H:%M')"
  git push origin main
fi
EOS
chmod +x "$PROJECT/auto_push.sh" && \
PLIST="$HOME/Library/LaunchAgents/com.c123ir.autopush.haderboon.plist" && \
cat > "$PLIST" <<EOS
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.c123ir.autopush.haderboon</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>$PROJECT/auto_push.sh</string>
  </array>
  <key>WatchPaths</key>
  <array>
    <string>$PROJECT</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>/tmp/autopush_haderboon.out</string>
  <key>StandardErrorPath</key><string>/tmp/autopush_haderboon.err</string>
</dict>
</plist>
EOS
launchctl bootstrap gui/$(id -u) "$PLIST"
