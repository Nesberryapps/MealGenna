"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonIcon?: "Camera" | LucideIcon;
  imageUrl: string;
  imageAlt: string;
  imageHint: string;
}

const iconMap = {
  Camera: Camera,
};

export function ActionCard({ 
  title, 
  description, 
  buttonText, 
  buttonIcon: rawButtonIcon,
  imageUrl,
  imageAlt,
  imageHint
}: ActionCardProps) {
  const ButtonIcon = typeof rawButtonIcon === 'string' ? iconMap[rawButtonIcon] : rawButtonIcon;

  return (
    <Card className="w-full mx-auto shadow-lg bg-card border-none overflow-hidden rounded-xl">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <Image 
            src={imageUrl} 
            alt={imageAlt}
            width={128}
            height={128}
            className="rounded-full object-cover w-32 h-32"
            data-ai-hint={imageHint}
          />
        </div>
        <h3 className="text-2xl font-bold text-card-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 px-4">{description}</p>
        <Button className="w-full text-base font-semibold py-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
          {ButtonIcon && <ButtonIcon className="mr-2" />}
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
