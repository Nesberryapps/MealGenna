
'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import Link from "next/link";
  
  interface LimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToPurchase: () => void;
  }
  
  export function LimitModal({ isOpen, onClose, onSwitchToPurchase }: LimitModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Free Generation Used</DialogTitle>
            <DialogDescription className="pt-2 text-base">
              You've used your free meal generation. To continue, please purchase a credit pack or get unlimited generations on our mobile app.
            </DialogDescription>
          </DialogHeader>
  
          <div className="flex flex-col items-center gap-4 py-4">
             <Button onClick={onSwitchToPurchase}>Purchase a Generation Pack</Button>
             <p className="text-sm text-muted-foreground">or</p>
             <p className="font-semibold">Get the mobile app for ad-supported generations!</p>
            
            <div className="flex gap-4 justify-center">
              <Link href="https://play.google.com/store/apps/details?id=com.nesberry.mealgenna.pro" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                  alt="Get it on Google Play" 
                  className="h-16 w-auto"
                />
              </Link>
  
              <Link href="https://apps.apple.com/us/app/mealgenna-pro/id6503874984" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img 
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                  alt="Download on the App Store" 
                  className="h-16 w-auto"
                />
              </Link>
            </div>
          </div>
  
          <DialogFooter className="sm:justify-center">
            <Button type="button" variant="secondary" onClick={onClose}>
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
