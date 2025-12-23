
// AdMob has been temporarily disabled to debug the iOS build.

import { Capacitor } from '@capacitor/core';

// 1. Initialize AdMob
export const initializeAdMob = async () => {
  if (Capacitor.getPlatform() === 'web') return;
  console.log("AdMob disabled for this build.");
};

// 2. Show the Ad Every OTHER time (Ad -> Free -> Ad -> Free)
export const showWatchToGenerateAd = async (onRewardEarned: () => void) => {
  console.log("AdMob disabled for this build. Granting reward immediately.");
  onRewardEarned();
};

// 3. Special "Double Ad" Logic for High-Value 7-Day Plan
export const showSevenDayPlanAds = async (onComplete: () => void) => {
  console.log("AdMob disabled for this build. Granting reward immediately.");
  onComplete();
};
