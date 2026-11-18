#!/bin/zsh
# Render an Icon Composer .icon to public/icons/<slug>.avif and <slug>-dark.avif (128px, AVIF quality 70).
# Usage: scripts/export-icon.sh path/to/App.icon slug
# Renders the default light/dark styles even if your Mac uses Clear or Tinted icons.
# Uses a private macOS IconServices API, so it may break in a future macOS.
set -e
ICON=${1:?path to .icon}; SLUG=${2:?slug}
ROOT=${0:A:h:h}; OUT=$ROOT/public/icons; W=$(mktemp -d)
APP=$W/$SLUG.app; RENDER=$W/render
mkdir -p $APP/Contents/{Resources,MacOS} $OUT
cp -R "$ICON" $W/AppIcon.icon
xcrun actool $W/AppIcon.icon --compile $APP/Contents/Resources --platform macosx \
  --minimum-deployment-target 26.0 --app-icon AppIcon --output-partial-info-plist $W/p.plist >/dev/null
cp /usr/bin/true $APP/Contents/MacOS/x
cat > $APP/Contents/Info.plist <<P
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict><key>CFBundleIdentifier</key><string>local.iconexport.$SLUG.$RANDOM</string><key>CFBundlePackageType</key><string>APPL</string><key>CFBundleExecutable</key><string>x</string><key>CFBundleIconName</key><string>AppIcon</string></dict></plist>
P
swiftc -O $ROOT/scripts/render-icon.swift -o $RENDER
# args: app, out, appearance (0 light, 1 dark), variant, size
$RENDER $APP $W/light.png 0 0 128 >/dev/null
$RENDER $APP $W/dark.png 1 0 128 >/dev/null
sips -s format avif -s formatOptions 70 $W/light.png --out $OUT/$SLUG.avif >/dev/null
sips -s format avif -s formatOptions 70 $W/dark.png --out $OUT/$SLUG-dark.avif >/dev/null
rm -r $W
echo "wrote $OUT/$SLUG.avif and $OUT/$SLUG-dark.avif"
