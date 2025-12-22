
'use client';

import { Capacitor } from '@capacitor/core';
import Purchases, { LOG_LEVEL, PurchasesOffering, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';

// --- IMPORTANT: ADD YOUR REVENUECAT API KEYS HERE ---
const REVENUECAT_API_KEY_ANDROID = 'goog_EarGAXOhvCmNorhPDwVQXRRYfgR';
const REVENUECAT_API_KEY_IOS = 'appl_HgJWZQBHyaAcXNhibMlDiXzBzKa';
// ----------------------------------------------------

const ENTITLEMENT_ID = 'pro'; // This should match the Entitlement ID in your RevenueCat dashboard

// 1. Initialize RevenueCat
export const initializePurchases = async () => {
  if (Capacitor.getPlatform() === 'web') return;

  try {
    const apiKey = Capacitor.getPlatform() === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
    await Purchases.configure({ apiKey });
    console.log('RevenueCat configured successfully.');
  } catch (e) {
    console.error('Error configuring RevenueCat:', e);
  }
};

// 2. Get Subscription Offerings
export const getOfferings = async (): Promise<PurchasesOffering[]> => {
  if (Capacitor.getPlatform() === 'web') return [];

  try {
    const { current, all } = await Purchases.getOfferings();
    if (current) {
        console.log('Current Offering:', current);
        return [current];
    }
    return [];
  } catch (e) {
    console.error('Error getting offerings:', e);
    return [];
  }
};

// 3. Make a Purchase
export const makePurchase = async (pkg: PurchasesPackage): Promise<CustomerInfo | null> => {
   if (Capacitor.getPlatform() === 'web') return null;

  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return customerInfo;
  } catch (e: any) {
    if (!e.userCancelled) {
      console.error('Error making purchase:', e);
    }
    return null;
  }
};

// 4. Restore Purchases
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (Capacitor.getPlatform() === 'web') return null;

  try {
    const { customerInfo } = await Purchases.restore();
    return customerInfo;
  } catch (e) {
    console.error('Error restoring purchases:', e);
    return null;
  }
};

// 5. Check Subscription Status
export const checkSubscription = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() === 'web') return false;
  
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    // Check if the user has the 'pro' entitlement active
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.error('Error checking subscription:', e);
    return false;
  }
};

// 6. Add a listener for subscription changes
export const addPurchaseUpdateListener = (callback: (isPro: boolean) => void) => {
    if (Capacitor.getPlatform() === 'web') return;

    Purchases.addCustomerInfoUpdateListener((customerInfo: CustomerInfo) => {
        const isPro = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
        callback(isPro);
    });
};
