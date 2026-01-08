
'use client';

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import Link from 'next/link';

export function WebDownloadModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If not running as a native app (i.e., running in browser), show modal
    if (!Capacitor.isNativePlatform()) {
      setIsOpen(true);
    }
  }, []);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-center">Get the MealGenna App</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg pt-2">
            To generate meal plans, scan ingredients, and access premium features, please download our mobile app.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4 pt-4">
            <Button size="lg" className="w-full gap-2" asChild>
                <Link href="https://apps.apple.com" target="_blank">
                    <Download className="w-5 h-5" />
                    Download for iOS
                </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full gap-2" asChild>
                <Link href="https://play.google.com" target="_blank">
                    <Smartphone className="w-5 h-5" />
                    Download for Android
                </Link>
            </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
