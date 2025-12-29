import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { Label } from '@/components/ui/label';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  import { Checkbox } from "@/components/ui/checkbox";
  import { ALLERGIES, CUISINE_PREFERENCES, DIETARY_PREFERENCES } from '@/lib/data';
  
  export default function PreferencesPage() {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-headline">Your Preferences</h1>
          <p className="text-muted-foreground mt-2">
            Tailor your meal suggestions to your taste and needs.
          </p>
        </div>
  
        <Card>
          <CardHeader>
            <CardTitle>Dietary Needs</CardTitle>
            <CardDescription>
              Select any dietary restrictions or special diets you follow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DIETARY_PREFERENCES.map(preference => (
              <div key={preference.id} className="flex items-center space-x-2">
                <Checkbox id={`diet-${preference.id}`} />
                <Label htmlFor={`diet-${preference.id}`} className="font-normal">{preference.label}</Label>
              </div>
            ))}
          </CardContent>
        </Card>
  
        <Card>
          <CardHeader>
            <CardTitle>Favorite Cuisines</CardTitle>
            <CardDescription>
              Let us know what types of food you enjoy.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CUISINE_PREFERENCES.map(cuisine => (
                <div key={cuisine.id} className="flex items-center space-x-2">
                    <Checkbox id={`cuisine-${cuisine.id}`} />
                    <Label htmlFor={`cuisine-${cuisine.id}`} className="font-normal">{cuisine.label}</Label>
                </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allergies</CardTitle>
            <CardDescription>
              Select any food allergies. This will help filter out unsafe recipes.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ALLERGIES.map(allergy => (
                <div key={allergy.id} className="flex items-center space-x-2">
                    <Checkbox id={`allergy-${allergy.id}`} />
                    <Label htmlFor={`allergy-${allergy.id}`} className="font-normal">{allergy.label}</Label>
                </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  