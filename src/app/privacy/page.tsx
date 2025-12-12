
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container py-12 md:py-20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as your dietary and cuisine preferences. When you use our camera scanning feature, images are sent to our AI service provider for analysis and are not stored by us. We may also collect anonymous usage data to improve our services and for advertising purposes.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. How We Use Information</h2>
          <p>
            The information we collect is used solely to provide and improve the MealGenna service. Your preferences are used to tailor the AI-generated meal suggestions. We do not sell your personal information to third parties.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Data Storage and Security</h2>
          <p>
            The data you provide, such as preferences or pantry items, may be stored in your browser's local storage or on your device to enhance your experience. We take reasonable measures to protect your information, but no security system is impenetrable.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Third-Party Services</h2>
          <p>
            We use third-party AI services (such as Google's Generative AI) to power our features. Your prompts and the content you provide (like images for analysis) are processed by these services. We also use third-party advertising services (like Google AdMob) to show rewarded video ads. These services may collect and use data to provide personalized advertising. We recommend you review the privacy policies of our third-party partners for more information.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
          <p>
             You can clear any data stored in your browser's local storage or on your device by clearing your application's cache and site data. If you have any questions about your data, please contact us.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">6. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
