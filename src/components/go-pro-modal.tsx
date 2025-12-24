
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListChecks, Star } from "lucide-react";
import Link from "next/link";

interface GoProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoProModal({ isOpen, onClose }: GoProModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
            <Star className="h-12 w-12 mx-auto text-yellow-400" />
            <DialogTitle className="text-2xl font-bold">Get the Mobile App</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground pb-4">
                Unlock ad-supported generations and get the full experience on mobile.
            </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 justify-center py-4">
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

        <DialogFooter className="flex-col gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full">
              Maybe Later
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
