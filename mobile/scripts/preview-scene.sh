#!/bin/sh
# Render a theme scene on a simulator and screenshot it (developer tool).
#   scripts/preview-scene.sh <udid> "theme=night&range=30&mood=idle" out.png [wait-seconds]
# Relaunches the dev build with -lcPreview, which opens the scene preview route.
set -e
UDID="$1"; QUERY="$2"; OUT="$3"; WAIT="${4:-7}"
xcrun simctl terminate "$UDID" com.lotteryclock.app >/dev/null 2>&1 || true
xcrun simctl launch "$UDID" com.lotteryclock.app -lcPreview "$QUERY" >/dev/null
sleep "$WAIT"
xcrun simctl io "$UDID" screenshot "$OUT" >/dev/null 2>&1
echo "$OUT"
