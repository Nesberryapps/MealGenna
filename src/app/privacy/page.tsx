import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We collect information to provide and improve our service. The types of information we may collect include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Pantry Information:</strong> Images you upload and the list of items identified from those images are used to generate recipes. This data is processed by our AI service but is not stored long-term with your personal identity.</li>
            <li><strong>Usage Data:</strong> We may collect information about how you use the app to help us improve features and functionality.</li>
          </ul>

          <h3 className="font-semibold text-lg pt-4">How We Use Your Information</h3>
          <p>
            We use the information we collect to operate, maintain, and provide you with the features of MealGenna, including to generate recipes and personalize your experience.
          </p>

          <h3 className="font-semibold text-lg pt-4">Data Security</h3>
          <p>
            We are committed to protecting your data. We use various security measures to ensure the safety of your information.
          </p>

          <h3 className="font-semibold text-lg pt-4">Changes to This Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
