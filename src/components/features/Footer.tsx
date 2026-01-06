
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 mt-auto pb-8 pt-12">
      <Separator />
      <div className="flex justify-center items-center space-x-4 sm:space-x-6 text-sm text-muted-foreground pt-6">
        <Link href="/about" legacyBehavior>
          <a className="hover:text-primary transition-colors">About</a>
        </Link>
        <Link href="/contact" legacyBehavior>
          <a className="hover:text-primary transition-colors">Contact</a>
        </Link>
        <Link href="/privacy" legacyBehavior>
          <a className="hover:text-primary transition-colors">Privacy</a>
        </Link>
        <Link href="/terms" legacyBehavior>
          <a className="hover:text-primary transition-colors">Terms</a>
        </Link>
      </div>
      <p className="text-center text-xs text-muted-foreground/50 mt-4">
        &copy; {new Date().getFullYear()} MealGenna. All rights reserved.
      </p>
    </footer>
  );
}
