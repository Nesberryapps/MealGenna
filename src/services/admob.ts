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

// 2. Show the Ad Every OTHER time (Ad -> Free -> Ad -> Free)
export const showWatchToGenerateAd = async (onRewardEarned: () => void) => {
  // A. Check Web Platform
  if (Capacitor.getPlatform() === 'web') {
    console.log("Web Mode: Skipping ad.");
    onRewardEarned();
    return;
  }

  // B. Check the "Frequency" Counter from phone storage
  // Default to '0' if it doesn't exist yet
  const currentCount = parseInt(localStorage.getItem('mealGenAdCount') || '0');

  // Logic: If count is ODD (1, 3, 5), skip the ad.
  // This means: 0 (Ad), 1 (Free), 2 (Ad), 3 (Free)...
  if (currentCount % 2 !== 0) {
    console.log(`Count is ${currentCount}: User gets a FREE generation!`);
    
    // Increment counter and save
    localStorage.setItem('mealGenAdCount', (currentCount + 1).toString());
    
    // Grant reward immediately without ad
    onRewardEarned();
    return; 
  }

  // C. If we are here, it's time to watch an ad! (Count is 0, 2, 4...)
  const adId = Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-3940256099942544/1712485313'  // iOS Test ID
    : 'ca-app-pub-3940256099942544/5224354917'; // Android Test ID

  // FIX: Listener needs to be set up before showing
  const rewardListener = await AdMob.addListener(
    RewardAdPluginEvents.Rewarded,
    (reward: AdMobRewardItem) => {
      console.log('User watched the video!', reward);
      
      // Increment counter and save so next time is free
      localStorage.setItem('mealGenAdCount', (currentCount + 1).toString());
      
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
    // If ad fails (no internet?), usually we let them pass to be nice
    // But we DON'T increment counter, so they have to try watching again next time
    onRewardEarned();
    rewardListener.remove();
  }
};