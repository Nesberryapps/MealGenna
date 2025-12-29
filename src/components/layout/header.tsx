import { ChefHat } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Button variant="ghost" asChild>
        <Link href={href}>{children}</Link>
    </Button>
)

export function Header() {
  return (
    <header className="hidden md:block bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ChefHat className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            MealGenna
          </span>
        </Link>
        <nav className="flex items-center space-x-2">
            <NavLink href="/">AI Generator</NavLink>
            <NavLink href="/discover">Discover</NavLink>
            <NavLink href="/plan">Meal Plan</NavLink>
            <NavLink href="/preferences">Preferences</NavLink>
        </nav>
      </div>
    </header>
  );
}
