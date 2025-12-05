import { AdMob, RewardAdOptions, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// 1. Initialize AdMob
export const initializeAdMob = async () => {
  // Skip if running in a web browser (like IDX preview)
  if (Capacitor.getPlatform() === 'web') return;

  try {
    // FIX 1: Request tracking authorization is now a separate call (iOS only)
    if (Capacitor.getPlatform() === 'ios') {
        await AdMob.requestTrackingAuthorization();
    }

    await AdMob.initialize({
      // FIX 2: Removed 'requestTrackingAuthorization' property from here
      testingDevices: ['YOUR_TEST_DEVICE_ID'], 
      initializeForTesting: true,
    });
    console.log('AdMob initialized');
  } catch (e) {
    console.error('Failed to init AdMob', e);
  }
};

// 2. Show the Ad and run the callback ONLY if successful
export const showWatchToGenerateAd = async (onRewardEarned: () => void) => {
  if (Capacitor.getPlatform() === 'web') {
    console.log("Web Mode: Skipping ad, generating immediately.");
    onRewardEarned(); 
    return;
  }

  const adId = Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-6191158195654090/7842725756' 
    : 'ca-app-pub-6191158195654090/2827553869';

  // FIX 3: Changed event name to 'Rewarded'
  const rewardListener = await AdMob.addListener(
    RewardAdPluginEvents.Rewarded, 
    (reward: AdMobRewardItem) => {
      console.log('User watched the video!', reward);
      onRewardEarned(); 
      rewardListener.remove(); 
    }
  );

  try {
    const options: RewardAdOptions = { adId };
    await AdMob.prepareRewardVideoAd(options);
    await AdMob.showRewardVideoAd();
  } catch (error) {
    console.error('Ad failed to load/show:', error);
    // Optional: decided if you want to let them generate anyway on error
    // onRewardEarned(); 
    rewardListener.remove();
  }
};