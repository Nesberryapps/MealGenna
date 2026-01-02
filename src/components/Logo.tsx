import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("bg-primary p-2 rounded-lg flex items-center justify-center", className)}>
      <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
    </div>
  );
}
