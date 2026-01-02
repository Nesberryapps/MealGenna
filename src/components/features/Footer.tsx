import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 mt-auto pb-8 pt-12">
      <Separator />
      <div className="flex justify-center items-center space-x-4 sm:space-x-6 text-sm text-muted-foreground pt-6">
        <Link href="/about" className="hover:text-primary transition-colors">
          About
        </Link>
        <Link href="/contact" className="hover:text-primary transition-colors">
          Contact
        </Link>
        <Link href="/privacy" className="hover:text-primary transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-primary transition-colors">
          Terms
        </Link>
      </div>
      <p className="text-center text-xs text-muted-foreground/50 mt-4">
        &copy; {new Date().getFullYear()} MealGenius. All rights reserved.
      </p>
    </footer>
  );
}
