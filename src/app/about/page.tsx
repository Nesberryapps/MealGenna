import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutUsPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">About MealGenna</h1>
        <p className="text-muted-foreground mt-2">
          The story behind your favorite meal planning assistant.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Welcome to MealGenna! Our mission is to make meal planning and recipe discovery effortless and fun for everyone. We believe that a good meal brings people together, and finding the right recipe should be an exciting experience, not a chore.
          </p>
          <p>
            Whether you're a seasoned chef or just starting out in the kitchen, MealGenna is here to inspire you. By simply showing us what's in your pantry, our powerful AI can help you create delicious meals, reduce food waste, and discover new culinary horizons.
          </p>
          <p>
            Thank you for joining our community. We're excited to be a part of your cooking journey!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
