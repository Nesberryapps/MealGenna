import { AdMob, RewardAdOptions, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { getAnalytics, logEvent } from "firebase/analytics";

// --- NEW: Google Ads Conversion Tracking Function via Firebase ---
const reportAdRewardConversion = () => {
    // Check if running in a browser environment where Firebase can be initialized.
    if (typeof window !== 'undefined') {
        try {
            const analytics = getAnalytics();
            // This is the event name from your Google Ads screenshot.
            logEvent(analytics, 'ads_conversion_in_app_ad_revenue', {
                value: 0.01, // Optional: Assign a nominal value
                currency: 'USD'
            });
            console.log('Reported ads_conversion_in_app_ad_revenue event to Firebase Analytics.');
        } catch (error) {
            console.error('Failed to log Firebase Analytics event:', error);
        }
    } else {
        console.warn('Firebase Analytics not available. Could not report ad conversion.');
    }
};

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
    ? 'ca-app-pub-6191158195654090/7842725756'  // iOS Test ID
    : 'ca-app-pub-6191158195654090/2827553869'; // Android Test ID

  // FIX: Listener needs to be set up before showing
  const rewardListener = await AdMob.addListener(
    RewardAdPluginEvents.Rewarded,
    (reward: AdMobRewardItem) => {
      console.log('User watched the video!', reward);
      
      // Increment counter and save so next time is free
      localStorage.setItem('mealGenAdCount', (currentCount + 1).toString());
      
      reportAdRewardConversion(); // <<< --- TRACK CONVERSION
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

// 3. Special "Double Ad" Logic for High-Value 7-Day Plan
export const showSevenDayPlanAds = async (onComplete: () => void) => {
  if (Capacitor.getPlatform() === 'web') {
    onComplete(); // Web users skip ads (or use Stripe logic elsewhere)
    return;
  }

  const adId = Capacitor.getPlatform() === 'ios'
    ? 'ca-app-pub-6191158195654090/7842725756'  // iOS Test ID
    : 'ca-app-pub-6191158195654090/2827553869'; // Android Test ID

  // --- Helper to show one ad ---
  const playAd = async (): Promise<boolean> => {
    return new Promise(async (resolve) => {
      let resolved = false;
      
      const listener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded, 
        () => {
          reportAdRewardConversion(); // <<< --- TRACK CONVERSION
          if (!resolved) { resolved = true; resolve(true); }
          listener.remove();
        }
      );

      // Handle close/fail without reward
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
        resolve(true); // Fallback: If ad fails to load, let them pass
      }
    });
  };

  // --- EXECUTE THE CHAIN ---
  // 1. Play First Ad
  const firstAdSuccess = await playAd();
  
  if (firstAdSuccess) {
    // 2. Alert user
    alert("Great! Watch 1 more ad to unlock your full Weekly Plan.");
    
    // 3. Play Second Ad
    const secondAdSuccess = await playAd();
    
    if (secondAdSuccess) {
      // 4. Success!
      onComplete();
    }
  }
};
