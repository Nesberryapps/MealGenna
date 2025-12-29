import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export interface Meal {
  id: string;
  name: string;
  description: string;
  image: ImagePlaceholder;
}

const mealImageMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

export const MEALS: Meal[] = [
  { id: 'pasta-bolognese', name: 'Pasta Bolognese', description: 'A classic Italian pasta dish with a rich meat sauce.', image: mealImageMap.get('pasta-bolognese')! },
  { id: 'chicken-stir-fry', name: 'Chicken Stir-Fry', description: 'Quick and healthy chicken and vegetable stir-fry.', image: mealImageMap.get('chicken-stir-fry')! },
  { id: 'taco-salad', name: 'Taco Salad', description: 'A fresh and vibrant salad with all the flavors of a taco.', image: mealImageMap.get('taco-salad')! },
  { id: 'vegetarian-chili', name: 'Vegetarian Chili', description: 'Hearty and spicy chili made with beans and vegetables.', image: mealImageMap.get('vegetarian-chili')! },
  { id: 'grilled-salmon', name: 'Grilled Salmon', description: 'Perfectly grilled salmon with a side of asparagus.', image: mealImageMap.get('grilled-salmon')! },
  { id: 'margarita-pizza', name: 'Margarita Pizza', description: 'Classic pizza with fresh tomatoes, mozzarella, and basil.', image: mealImageMap.get('margarita-pizza')! },
  { id: 'beef-burgers', name: 'Beef Burgers', description: 'Juicy homemade beef burgers on a brioche bun.', image: mealImageMap.get('beef-burgers')! },
  { id: 'quinoa-salad', name: 'Quinoa Salad', description: 'A light and refreshing quinoa salad with mixed greens.', image: mealImageMap.get('quinoa-salad')! },
  { id: 'pancakes', name: 'Pancakes', description: 'Fluffy buttermilk pancakes with maple syrup and berries.', image: mealImageMap.get('pancakes')! },
  { id: 'scrambled-eggs', name: 'Scrambled Eggs', description: 'Creamy scrambled eggs with toast.', image: mealImageMap.get('scrambled-eggs')! },
  { id: 'oatmeal', name: 'Oatmeal', description: 'Warm oatmeal with fruits and nuts.', image: mealImageMap.get('oatmeal')! },
  { id: 'chicken-soup', name: 'Chicken Noodle Soup', description: 'Comforting chicken noodle soup.', image: mealImageMap.get('chicken-soup')! },
  { id: 'club-sandwich', name: 'Club Sandwich', description: 'A classic triple-decker club sandwich.', image: mealImageMap.get('club-sandwich')! },
  { id: 'sushi-rolls', name: 'Sushi Rolls', description: 'Assorted sushi rolls with wasabi and ginger.', image: mealImageMap.get('sushi-rolls')! },
  { id: 'steak-dinner', name: 'Steak Dinner', description: 'A perfectly cooked steak with potatoes and vegetables.', image: mealImageMap.get('steak-dinner')! },
];

export const BREAKFAST_MEALS = MEALS.filter(m => ['pancakes', 'scrambled-eggs', 'oatmeal'].includes(m.id));
export const LUNCH_MEALS = MEALS.filter(m => ['quinoa-salad', 'chicken-soup', 'club-sandwich', 'taco-salad'].includes(m.id));
export const DINNER_MEALS = MEALS.filter(m => !BREAKFAST_MEALS.includes(m) && !LUNCH_MEALS.includes(m));

export const DIETARY_PREFERENCES = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
];

export const CUISINE_PREFERENCES = [
  { id: 'italian', label: 'Italian' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'asian', label: 'Asian' },
  { id: 'indian', label: 'Indian' },
  { id: 'mediterranean', label: 'Mediterranean' },
];

export const ALLERGIES = [
    { id: 'nuts', label: 'Nuts' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'soy', label: 'Soy' },
    { id: 'gluten', label: 'Gluten' },
]
