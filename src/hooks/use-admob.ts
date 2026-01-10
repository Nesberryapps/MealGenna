
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useToast } from './use-toast';

// Define a minimal type for AdMob to avoid importing the whole package.
// This helps prevent server-side bundling issues.
type AdMobType = {
  initialize(options: {}): Promise<void>;
  prepareRewardVideoAd(options: { adId: string; isTesting: boolean; }): Promise<void>;
  showRewardVideoAd(): Promise<void>;
  addListener(eventName: string, listenerFunc: (info: any) => void): { remove: () => void; };
};

type AdMobError = {
  code: number;
  message: string;
};


// --- Test Ad Unit IDs from Google ---
const AD_UNIT_ID_ANDROID = 'ca-app-pub-3940256099942544/5224354917';
const AD_UNIT_ID_IOS = 'ca-app-pub-3940256099942544/1712485313';
// ------------------------------------

export const useAdMob = () => {
  const [admob, setAdmob] = useState<AdMobType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
        try {
          // Construct the package name as a string to prevent static analysis by the build tool.
          // This is the key to preventing the "Module not found" error.
          const admobPackageName = '@capacitor-community/admob';
          const { AdMob } = await import(/* webpackIgnore: true */ admobPackageName);
          await AdMob.initialize({});
          setAdmob(AdMob);
        } catch (e) {
          console.error("AdMob initialization failed", e);
        }
      }
    };
    initialize();
  }, []);

  const getAdUnitId = useCallback(() => {
    if (Capacitor.getPlatform() === 'android') {
      return AD_UNIT_ID_ANDROID;
    }
    if (Capacitor.getPlatform() === 'ios') {
      return AD_UNIT_ID_IOS;
    }
    return '';
  }, []);

  const showRewardedAd = useCallback(async (rewardCount = 1): Promise<boolean> => {
    // If admob is null, it means we are not on a native platform or it hasn't initialized.
    // In a non-native environment (like web), we grant the reward immediately.
    if (!admob) {
      console.log('AdMob not available. Granting reward.');
      return true;
    }

    setIsLoading(true);
    let rewarded = false;
    let completedAds = 0;

    const options = {
      adId: getAdUnitId(),
      isTesting: true, // Set to false for production
    };

    return new Promise<boolean>((resolve) => {
      const showAd = async () => {
        try {
          await admob.prepareRewardVideoAd(options);
          await admob.showRewardVideoAd();
        } catch (e) {
          console.error('Error showing ad:', e);
          toast({
            variant: 'destructive',
            title: 'Ad Error',
            description: 'Could not load ad. Please try again later.',
          });
          setIsLoading(false);
          resolve(false); // Ad failed to show
        }
      };

      const rewardListener = admob.addListener('rewardedVideoAdRewarded', (reward) => {
        console.log('Reward received:', reward);
        completedAds++;
        if (completedAds >= rewardCount) {
          rewarded = true;
          cleanupAndResolve(true);
        } else {
          // Automatically show the next ad in the sequence
          showAd();
        }
      });

      const dismissListener = admob.addListener('rewardedVideoAdDismissed', () => {
        if (!rewarded) {
          toast({
            title: 'Ad Canceled',
            description: `You must watch all ${rewardCount} ad(s) to get the reward.`,
          });
          cleanupAndResolve(false);
        }
      });
      
      const failedListener = admob.addListener('rewardedVideoAdFailedToLoad', (error: AdMobError) => {
          console.error('Failed to load ad:', error);
          toast({
              variant: 'destructive',
              title: 'Ad Failed',
              description: 'The ad failed to load. Please check your connection and try again.',
          });
          cleanupAndResolve(false);
      });

      const cleanupAndResolve = (result: boolean) => {
        rewardListener.remove();
        dismissListener.remove();
        failedListener.remove();
        setIsLoading(false);
        resolve(result);
      };

      // Start the ad sequence
      showAd();
    });
  }, [admob, getAdUnitId, toast]);

  return { showRewardedAd, isLoading };
};
