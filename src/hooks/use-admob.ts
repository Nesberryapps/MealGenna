
'use client';

import { useState } from 'react';

// This is a mock implementation of the AdMob hook.
// In a real application, you would use the actual AdMob SDK.
export const useAdMob = () => {
  const [isAdShowing, setIsAdShowing] = useState(false);

  const showRewardedVideo = (onReward: () => void) => {
    setIsAdShowing(true);
    console.log("Simulating watching a rewarded video ad...");

    // Simulate watching the ad for 3 seconds
    setTimeout(() => {
      console.log("Ad watched successfully. Granting reward.");
      setIsAdShowing(false);
      onReward();
    }, 3000);
  };

  return {
    isAdShowing,
    showRewardedVideo,
  };
};
