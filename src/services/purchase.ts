
import { 
  Purchases, 
  PurchasesPackage, 
  CustomerInfo,
  PurchasesOfferings,
  LOG_LEVEL
} from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// REPLACE THESE WITH YOUR ACTUAL KEYS FROM REVENUECAT DASHBOARD
const REVENUECAT_API_KEY_IOS = 'appl_HgJWZQBHyaAcXNhibMlDiXzBzKa'; // Your iOS Public API Key
const REVENUECAT_API_KEY_ANDROID = 'goog_EarGAXOhvCmNorhPDwVQXRRYfgR'; // Your Android Public API Key

// The name of the Entitlement you created in RevenueCat (e.g. "pro", "premium")
const ENTITLEMENT_ID = 'pro'; 

export const initializePurchases = async () => {
  if (Capacitor.getPlatform() === 'web') return;

  try {
    const apiKey = Capacitor.getPlatform() === 'ios' 
      ? REVENUECAT_API_KEY_IOS 
      : REVENUECAT_API_KEY_ANDROID;

    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
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
    const offerings: PurchasesOfferings = await Purchases.getOfferings();
    
    if (offerings.all && offerings.all.default) {
        return [offerings.all.default];
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
      console.error('Purchase error:', e);
    }
    return null;
  }
};

// 4. Restore Purchases (Required by Apple)
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  if (Capacitor.getPlatform() === 'web') return null;

  try {
    const { customerInfo } = await Purchases.restorePurchases();
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
    
    return customerInfo?.entitlements.active[ENTITLEMENT_ID] !== undefined;

  } catch (e) {
    console.error('Error checking subscription:', e);
    return false;
  }
};

// 6. Listen for changes (e.g. subscription expired)
export const addPurchaseUpdateListener = (callback: (isPro: boolean) => void) => {
  if (Capacitor.getPlatform() === 'web') return;

  Purchases.addCustomerInfoUpdateListener((info: CustomerInfo) => {
    const isPro = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
    callback(isPro);
  });
};
