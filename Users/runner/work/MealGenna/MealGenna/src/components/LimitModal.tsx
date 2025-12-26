
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
    onGoToAppStores: () => void;
  }
  
  export function LimitModal({ isOpen, onClose, onGoToAppStores }: LimitModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Free Generation Used</DialogTitle>
            <DialogDescription className="pt-2 text-base">
              You've used your free meal generation. For unlimited ad-supported generations, please download our mobile app.
            </DialogDescription>
          </DialogHeader>
  
          <div className="flex flex-col items-center gap-4 py-4">
             <Button onClick={onGoToAppStores}>Get the Mobile App</Button>
             <p className="font-semibold mt-4">Download now for unlimited generations!</p>
            
            <div className="flex gap-4 justify-center">
              <Link href="https://play.google.com/store/apps/details?id=com.nesberry.mealgenna.pro" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                  alt="Get it on Google Play" 
                  className="h-16 w-auto"
                />
              </Link>
  
              <Link href="https://apps.apple.com/us/app/mealgenna-ai-meal-planner/id6755921708" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
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

    