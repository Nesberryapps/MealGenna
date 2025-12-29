import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#9CDE35', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#D8C825', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <g transform="translate(0, 5)">
        <path
          d="M20,90 C10,90 10,80 10,70 L10,55 C20,50 30,55 35,60 C38,55 40,40 40,20 L45,20 C45,40 42,55 40,60 C45,65 55,65 60,60 C58,55 55,40 55,20 L60,20 C60,40 57,55 65,60 C70,55 80,50 90,55 L90,70 C90,80 90,90 80,90 Z"
          fill="url(#logoGradient)"
        />
        <path
          d="M 47.5,10 L 47.5, 30 M 45,15 L 50,15 M 42.5,10 L 42.5, 30 M 52.5,10 L 52.5,30"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M30 30 C 30 20, 40 20, 40 30"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M60 30 C 60 20, 70 20, 70 30"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M45,75 L50,70 L55,75 L50,80 Z"
          fill="white"
        />
      </g>
    </svg>
  );
}
