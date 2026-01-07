#!/bin/bash
# Get absolute path to the keystore file which we placed in android/app/release.keystore
# The script runs from root, so PWD/android/app/release.keystore is the path.
KEYSTORE_PATH="$PWD/android/app/release.keystore"

echo "storePassword=$ANDROID_KEYSTORE_PASSWORD" > android/keystore.properties
echo "keyPassword=$ANDROID_KEY_PASSWORD" >> android/keystore.properties
echo "keyAlias=$ANDROID_KEY_ALIAS" >> android/keystore.properties
echo "storeFile=$KEYSTORE_PATH" >> android/keystore.properties
