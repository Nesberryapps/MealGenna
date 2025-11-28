
import AdBanner from '@/components/ad-banner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">About MealGenna</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Welcome to MealGenna, your personal AI-powered chef and meal planner. Our mission is to take the stress out of mealtime by providing instant, personalized meal ideas and comprehensive weekly plans.
          </p>
          <p>
            Whether you're looking for a quick dinner based on the ingredients you have on hand, a healthy recipe to fit your lifestyle, or a complete 7-day meal plan for your family, MealGenna is here to help. Our advanced AI understands your dietary needs and cuisine preferences to generate delicious and practical suggestions just for you.
          </p>
          <p>
            We believe that cooking should be a joy, not a chore. With our easy-to-use interface, you can scan your pantry, select your mood, and let our AI do the heavy lifting. From detailed recipes and nutritional information to grocery lists and online shopping integration, we provide all the tools you need to get cooking with confidence.
          </p>
          <p>
            Thank you for choosing MealGenna. Let's make something amazing together!
          </p>
        </CardContent>
      </Card>
       <section className="w-full pt-12 md:pt-24 lg:pt-32">
        <div className="container">
            <AdBanner />
        </div>
      </section>
    </div>
  );
}
