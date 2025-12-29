
'use client';

import { useEffect, useState, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles, Camera, X } from 'lucide-react';

import { getRecipes, getIdentifiedItems, type RecipeResult } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CUISINE_PREFERENCES, DIETARY_PREFERENCES } from '@/lib/data';

const formSchema = z.object({
  pantryItems: z.string().min(3, 'Please list at least one item.'),
  dietaryPreferences: z.string().optional(),
  cuisinePreferences: z.string().optional(),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Sparkles className="mr-2" />
      )}
      Generate Recipes
    </Button>
  );
}

export function RecipeGeneratorForm() {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState<RecipeResult, FormData>(
    getRecipes,
    { recipes: [] }
  );

  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pantryItems: '',
      dietaryPreferences: 'any',
      cuisinePreferences: 'any',
    },
  });

  useEffect(() => {
    form.setValue('pantryItems', pantryItems.join(', '));
  }, [pantryItems, form]);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (isScanning) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setIsScanning(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();

      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [isScanning, toast]);

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsIdentifying(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const photoDataUri = canvas.toDataURL('image/jpeg');

        const result = await getIdentifiedItems(photoDataUri);

        if (result.error) {
          toast({ variant: 'destructive', title: 'Identification Failed', description: result.error });
        } else {
          setPantryItems(prev => [...new Set([...prev, ...result.items])]);
        }
      }
      setIsScanning(false);
      setIsIdentifying(false);
    }
  };

  const removeItem = (itemToRemove: string) => {
    setPantryItems(prev => prev.filter(item => item !== itemToRemove));
  };

  if (isScanning) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
        <video ref={videoRef} className="w-full h-full object-cover rounded-md" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden"></canvas>
        {isIdentifying && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
            <Loader2 className="animate-spin h-10 w-10" />
            <p className="mt-4 text-lg">Identifying items...</p>
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
          <Button onClick={() => setIsScanning(false)} variant="outline" size="lg">Cancel</Button>
          <Button onClick={handleCapture} size="lg">Capture</Button>
        </div>
        {hasCameraPermission === false && (
          <Alert variant="destructive" className="absolute top-4">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
              Please allow camera access to use this feature. You may need to change permissions in your browser settings.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl text-center">
            What's in your pantry?
          </CardTitle>
          <CardDescription className="text-center">
            Scan your ingredients, and we'll whip up some recipe ideas for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={formAction}
              className="space-y-6"
            >
              <FormItem>
                <FormLabel>Pantry Items</FormLabel>
                <FormControl>
                  <div className="p-4 border-dashed border-2 rounded-lg min-h-[120px]">
                    {pantryItems.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {pantryItems.map(item => (
                          <Badge key={item} variant="secondary" className="text-base">
                            {item}
                            <button onClick={() => removeItem(item)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-center py-8">
                        Click "Scan Pantry" to start adding items.
                      </div>
                    )}
                  </div>
                </FormControl>
                <input type="hidden" {...form.register('pantryItems')} />
                <FormDescription>
                  Click "Scan Pantry" to add items with your camera.
                </FormDescription>
              </FormItem>

              <div className="flex justify-center">
                <Button type="button" onClick={() => setIsScanning(true)}>
                  <Camera className="mr-2" />
                  Scan Pantry
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dietaryPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preferences</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          {DIETARY_PREFERENCES.map(pref => (
                            <SelectItem key={pref.id} value={pref.label}>{pref.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Optional: Help us narrow down the results.</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cuisinePreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine Preferences</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          {CUISINE_PREFERENCES.map(pref => (
                            <SelectItem key={pref.id} value={pref.label}>{pref.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Optional: Craving a specific flavor?</FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center pt-4">
                <SubmitButton />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {state.recipes && state.recipes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Recipe Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 list-disc list-inside">
              {state.recipes.map((recipe, index) => (
                <li key={`${state.timestamp}-${index}`} className="text-foreground">
                  {recipe}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
