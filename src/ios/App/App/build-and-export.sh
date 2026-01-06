#!/bin/bash
set -eo pipefail

# --- Build and Archive iOS App ---
# This script is executed by the CI/CD pipeline in GitHub Actions.
# It builds the Xcode project and exports an IPA file.

# Variables
WORKSPACE_PATH="App.xcworkspace"
SCHEME="App"
CONFIGURATION="Release"
EXPORT_PATH="$RUNNER_TEMP/build"
ARCHIVE_PATH="$EXPORT_PATH/$SCHEME.xcarchive"
EXPORT_OPTIONS_PLIST_PATH="ExportOptions.plist"

# Clean the build folder
xcodebuild clean \
  -workspace "$WORKSPACE_PATH" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION"

# Create the archive
xcodebuild archive \
  -workspace "$WORKSPACE_PATH" \
  -scheme "$SCHEME" \
  -configuration "$CONFIGURATION" \
  -archivePath "$ARCHIVE_PATH" \
  -allowProvisioningUpdates

# Export the IPA
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS_PLIST_PATH"

echo "✅ IPA file successfully built and exported to $EXPORT_PATH/App.ipa"
