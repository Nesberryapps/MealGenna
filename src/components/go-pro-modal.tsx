
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListChecks, Star, Loader2 } from "lucide-react";
import { useState } from "react";

interface GoProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  isLoading: boolean;
}

export function GoProModal({ isOpen, onClose, onPurchase, isLoading }: GoProModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
            <Star className="h-12 w-12 mx-auto text-yellow-400" />
            <DialogTitle className="text-2xl font-bold">Upgrade to MealGenna Pro</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground pb-4">
                Unlock the ultimate meal planning experience.
            </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-left py-4">
            <div className="flex items-start gap-3">
                <ListChecks className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <p><b>Unlimited, Ad-Free Generations:</b> Get instant meal ideas and 7-day plans without interruptions.</p>
            </div>
            <div className="flex items-start gap-3">
                <ListChecks className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <p><b>Priority Access:</b> Be the first to get new features and updates.</p>
            </div>
             <div className="flex items-start gap-3">
                <ListChecks className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                <p><b>Support Development:</b> Your subscription helps us improve the app and add more exciting features.</p>
            </div>
        </div>

        <DialogFooter className="flex-col gap-2">
            <Button onClick={onPurchase} disabled={isLoading} size="lg" className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Processing..." : "Upgrade Now for $4.99/month"}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="w-full">
              Maybe Later
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
