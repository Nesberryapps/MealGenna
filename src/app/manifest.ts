
import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MealGenna',
    short_name: 'MealGenna',
    description: 'Instant Meal Ideas, Zero Hassle. AI-powered meal planning.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F5F5',
    theme_color: '#4CAF50',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
