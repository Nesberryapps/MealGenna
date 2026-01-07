#!/bin/bash
echo "storePassword=$ANDROID_KEYSTORE_PASSWORD" > android/keystore.properties
echo "keyPassword=$ANDROID_KEY_PASSWORD" >> android/keystore.properties
echo "keyAlias=$ANDROID_KEY_ALIAS" >> android/keystore.properties
echo "storeFile=release.keystore" >> android/keystore.properties
