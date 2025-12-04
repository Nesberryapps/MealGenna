
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-20">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
          <p>
            Welcome to MealGenna ("we", "our", "us"). These Terms & Conditions ("Terms") govern your use of our website and services. By accessing or using MealGenna, you agree to be bound by these Terms.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Use of Service</h2>
          <p>
            MealGenna provides AI-generated meal plans and recipes. This content is for informational purposes only. We do not guarantee the accuracy, completeness, or suitability of any information provided and are not responsible for any outcomes related to your use of this information. You are responsible for ensuring that any meals or ingredients are appropriate for your dietary needs and health conditions.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Payments and Services</h2>
          <p>
            We offer various AI-powered generation features. Generating single meal ideas is free. Generating a full 7-day meal plan requires a one-time payment of $7.99 per plan. All payments are processed through our third-party payment processor (Stripe) and are final and non-refundable. There are no subscriptions or recurring fees.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. User Conduct</h2>
          <p>
            You agree not to use the service for any unlawful purpose or to violate any laws in your jurisdiction. You agree not to misuse the AI generation features by submitting inappropriate or malicious prompts.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and software, is the property of MealGenna or its content suppliers and is protected by international copyright laws.
          </p>

          <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
          <p>
            In no event shall MealGenna be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our service.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">7. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
