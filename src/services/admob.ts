
import { AdMob, RewardAdOptions, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// This function can be called after a rewarded ad is successfully shown.
// For now, it will just log to the console. You can expand this later
// to use server-side analytics if needed.
const reportAdRewardConversion = () => {
    if (window.gtag_report_conversion) {
      window.gtag_report_conversion();
    }
    console.log('Ad reward conversion event reported.');
};

// 1. Initialize AdMob
export const initializeAdMob = async () => {
  // Skip if running in a web browser
  if (Capacitor.getPlatform() === 'web') return;

  try {
    if (Capacitor.getPlatform() === 'ios') {
        await AdMob.requestTrackingAuthorization();
    }

    await AdMob.initialize({
      testingDevices: ['YOUR_TEST_DEVICE_ID'], 
      initializeForTesting: true,
    });
    console.log('AdMob initialized');
  } catch (e) {
    console.error('Failed to init AdMob', e);
  }
};

// 2. Show a rewarded ad for a single meal generation
export const showWatchToGenerateAd = async (onRewardEarned: () => void) => {
  // A. Check Web Platform - this should not be called on web, but as a safeguard.
  if (Capacitor.getPlatform() === 'web') {
    console.log("Web Mode: Skipping ad.");
    onRewardEarned();
    return;
  }

  // B. Show the ad
  const adId = Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-6191158195654090/7842725756'
    : 'ca-app-pub-6191158195654090/2827553869';

  const rewardListener = await AdMob.addListener(
    RewardAdPluginEvents.Rewarded,
    (reward: AdMobRewardItem) => {
      console.log('User watched the video!', reward);
      reportAdRewardConversion();
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
    onRewardEarned(); // Let user pass if ad fails
    rewardListener.remove();
  }
};

// 3. Special "Double Ad" Logic for High-Value 7-Day Plan
export const showSevenDayPlanAds = async (onComplete: () => void) => {
  if (Capacitor.getPlatform() === 'web') {
    onComplete();
    return;
  }

  const adId = Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-6191158195654090/7842725756'
    : 'ca-app-pub-6191158195654090/2827553869';

  const playAd = async (): Promise<boolean> => {
    return new Promise(async (resolve) => {
      let resolved = false;
      
      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded, 
        () => {
          reportAdRewardConversion();
          if (!resolved) { resolved = true; resolve(true); }
          rewardListener.remove();
        }
      );

      const closeListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
           if (!resolved) { resolved = true; resolve(false); }
           closeListener.remove();
        }
      );

      try {
        await AdMob.prepareRewardVideoAd({ adId });
        await AdMob.showRewardVideoAd();
      } catch (e) {
        console.error(e);
        resolve(true); // Let user pass if ad fails
        rewardListener.remove();
        closeListener.remove();
      }
    });
  };

  const firstAdSuccess = await playAd();
  
  if (firstAdSuccess) {
    alert("Great! Watch 1 more ad to unlock your full Weekly Plan.");
    const secondAdSuccess = await playAd();
    
    if (secondAdSuccess) {
      onComplete();
    } else {
      alert("The second ad was not completed. Please try again to unlock the plan.");
    }
  } else {
      alert("You need to watch the ad to unlock this feature. Please try again.");
  }
};
