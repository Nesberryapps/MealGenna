
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
  import { Button } from "@/components/ui/button";
  import Image from "next/image";
  import Link from "next/link";
  
  interface LimitModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export function LimitModal({ isOpen, onClose }: LimitModalProps) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">The Mobile App is Here! 🚀</DialogTitle>
            <DialogDescription className="pt-2 text-base">
              You've used your free meal generation for today on the web.
              <br />
              Download our mobile app for <b>Unlimited Generations!</b>
            </DialogDescription>
          </DialogHeader>
  
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground">Available on iOS & Android</p>
            
            <div className="flex gap-4 justify-center">
              {/* Google Play Badge */}
              <Link href="https://play.google.com/store/apps/details?id=com.nesberry.mealgenna.pro" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                  alt="Get it on Google Play" 
                  className="h-16 w-auto"
                />
              </Link>
  
              {/* App Store Badge */}
              <Link href="https://apps.apple.com/us/developer/nesberry-software-llc/id1659984" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105">
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
              Continue on Web
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  