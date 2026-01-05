#!/bin/bash
set -ex

# Build and archive the app
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath "$RUNNER_TEMP/App.xcarchive" archive

# Export the archive to an IPA
xcodebuild -exportArchive -archivePath "$RUNNER_TEMP/App.xcarchive" -exportPath "$RUNNER_TEMP/build" -exportOptionsPlist exportOptions.plist
