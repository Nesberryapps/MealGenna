import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export interface Meal {
  id: string;
  name: string;
  description: string;
  image: ImagePlaceholder;
  ingredients: string[];
  instructions: string[];
  cookTime: string;
  nutritionalFacts: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

const mealImageMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

export const MEALS: Meal[] = [
  { 
    id: 'pasta-bolognese', 
    name: 'Pasta Bolognese', 
    description: 'A classic Italian pasta dish with a rich meat sauce.', 
    image: mealImageMap.get('pasta-bolognese')!,
    ingredients: ['1 lb pasta', '1 lb ground beef', '1 onion, chopped', '2 cloves garlic, minced', '28 oz can crushed tomatoes', '1/4 cup heavy cream', 'Salt and pepper to taste'],
    instructions: ['Cook pasta according to package directions.', 'In a large skillet, cook ground beef and onion until browned.', 'Add garlic and cook for 1 minute.', 'Stir in crushed tomatoes, salt, and pepper. Simmer for 15 minutes.', 'Stir in heavy cream.', 'Serve sauce over pasta.'],
    cookTime: '30 minutes',
    nutritionalFacts: { calories: '600', protein: '30g', carbs: '75g', fat: '20g' }
  },
  { 
    id: 'chicken-stir-fry', 
    name: 'Chicken Stir-Fry', 
    description: 'Quick and healthy chicken and vegetable stir-fry.', 
    image: mealImageMap.get('chicken-stir-fry')!,
    ingredients: ['1 lb chicken breast, sliced', '1 head broccoli, chopped', '1 red bell pepper, sliced', '1/4 cup soy sauce', '2 tbsp honey', '1 tbsp sesame oil'],
    instructions: ['In a wok, stir-fry chicken until cooked through.', 'Add broccoli and bell pepper, and stir-fry for 5 minutes.', 'In a small bowl, whisk together soy sauce, honey, and sesame oil.', 'Pour sauce over chicken and vegetables, and cook until heated through.', 'Serve with rice.'],
    cookTime: '25 minutes',
    nutritionalFacts: { calories: '450', protein: '40g', carbs: '30g', fat: '15g' }
  },
  { 
    id: 'taco-salad', 
    name: 'Taco Salad', 
    description: 'A fresh and vibrant salad with all the flavors of a taco.', 
    image: mealImageMap.get('taco-salad')!,
    ingredients: ['1 lb ground beef', '1 packet taco seasoning', '1 head lettuce, chopped', '1 cup cherry tomatoes, halved', '1 cup shredded cheddar cheese', '1/2 cup salsa', '1/4 cup sour cream'],
    instructions: ['Cook ground beef with taco seasoning.', 'Assemble the salad with lettuce, tomatoes, and cheese.', 'Top with cooked beef, salsa, and sour cream.'],
    cookTime: '20 minutes',
    nutritionalFacts: { calories: '550', protein: '35g', carbs: '25g', fat: '35g' }
  },
  { 
    id: 'vegetarian-chili', 
    name: 'Vegetarian Chili', 
    description: 'Hearty and spicy chili made with beans and vegetables.', 
    image: mealImageMap.get('vegetarian-chili')!,
    ingredients: ['1 can black beans, rinsed', '1 can kidney beans, rinsed', '1 can diced tomatoes', '1 onion, chopped', '2 tbsp chili powder', '1 tsp cumin'],
    instructions: ['In a large pot, combine all ingredients.', 'Bring to a simmer and cook for at least 30 minutes.', 'Serve with your favorite toppings.'],
    cookTime: '45 minutes',
    nutritionalFacts: { calories: '300', protein: '15g', carbs: '60g', fat: '2g' }
  },
  { 
    id: 'grilled-salmon', 
    name: 'Grilled Salmon', 
    description: 'Perfectly grilled salmon with a side of asparagus.', 
    image: mealImageMap.get('grilled-salmon')!,
    ingredients: ['2 salmon fillets', '1 bunch asparagus', '1 tbsp olive oil', 'Salt and pepper to taste', '1 lemon, sliced'],
    instructions: ['Preheat grill to medium-high.', 'Toss asparagus with olive oil, salt, and pepper.', 'Grill salmon and asparagus for 6-8 minutes per side.', 'Serve with lemon slices.'],
    cookTime: '15 minutes',
    nutritionalFacts: { calories: '400', protein: '40g', carbs: '10g', fat: '25g' }
  },
  { 
    id: 'margarita-pizza', 
    name: 'Margarita Pizza', 
    description: 'Classic pizza with fresh tomatoes, mozzarella, and basil.', 
    image: mealImageMap.get('margarita-pizza')!,
    ingredients: ['1 pizza dough', '1/2 cup tomato sauce', '8 oz fresh mozzarella, sliced', '1 tomato, sliced', '1/4 cup fresh basil'],
    instructions: ['Preheat oven to 475°F.', 'Roll out pizza dough and spread with sauce.', 'Top with mozzarella and tomato slices.', 'Bake for 10-12 minutes.', 'Garnish with fresh basil.'],
    cookTime: '20 minutes',
    nutritionalFacts: { calories: '700', protein: '30g', carbs: '80g', fat: '30g' }
  },
  { 
    id: 'beef-burgers', 
    name: 'Beef Burgers', 
    description: 'Juicy homemade beef burgers on a brioche bun.', 
    image: mealImageMap.get('beef-burgers')!,
    ingredients: ['1 lb ground beef', '4 brioche buns', '4 slices cheddar cheese', 'Lettuce, tomato, and onion for topping'],
    instructions: ['Form beef into 4 patties.', 'Grill or pan-sear burgers to desired doneness.', 'Top with cheese and serve on buns with toppings.'],
    cookTime: '20 minutes',
    nutritionalFacts: { calories: '650', protein: '40g', carbs: '40g', fat: '35g' }
  },
  { 
    id: 'quinoa-salad', 
    name: 'Quinoa Salad', 
    description: 'A light and refreshing quinoa salad with mixed greens.', 
    image: mealImageMap.get('quinoa-salad')!,
    ingredients: ['1 cup quinoa, cooked', '2 cups mixed greens', '1/2 cup cucumber, diced', '1/4 cup feta cheese, crumbled', '2 tbsp lemon vinaigrette'],
    instructions: ['Combine all ingredients in a large bowl.', 'Toss to combine and serve immediately.'],
    cookTime: '15 minutes (plus time to cook quinoa)',
    nutritionalFacts: { calories: '350', protein: '12g', carbs: '45g', fat: '15g' }
  },
  { 
    id: 'pancakes', 
    name: 'Pancakes', 
    description: 'Fluffy buttermilk pancakes with maple syrup and berries.', 
    image: mealImageMap.get('pancakes')!,
    ingredients: ['1 1/2 cups all-purpose flour', '3 1/2 tsp baking powder', '1 tsp salt', '1 tbsp white sugar', '1 1/4 cups milk', '1 egg', '3 tbsp butter, melted'],
    instructions: ['In a large bowl, sift together the flour, baking powder, salt and sugar.', 'Make a well in the center and pour in the milk, egg and melted butter; mix until smooth.', 'Heat a lightly oiled griddle or frying pan over medium high heat.', 'Pour or scoop the batter onto the griddle, using approximately 1/4 cup for each pancake. Brown on both sides and serve hot.'],
    cookTime: '20 minutes',
    nutritionalFacts: { calories: '350', protein: '8g', carbs: '50g', fat: '12g' }
  },
  { 
    id: 'scrambled-eggs', 
    name: 'Scrambled Eggs', 
    description: 'Creamy scrambled eggs with toast.', 
    image: mealImageMap.get('scrambled-eggs')!,
    ingredients: ['4 eggs', '1/4 cup milk', 'Salt and pepper to taste', '1 tbsp butter', '2 slices of toast'],
    instructions: ['Whisk eggs, milk, salt, and pepper.', 'Melt butter in a skillet over medium heat.', 'Add egg mixture and cook, stirring occasionally, until set.', 'Serve with toast.'],
    cookTime: '10 minutes',
    nutritionalFacts: { calories: '400', protein: '25g', carbs: '30g', fat: '20g' }
  },
  { 
    id: 'oatmeal', 
    name: 'Oatmeal', 
    description: 'Warm oatmeal with fruits and nuts.', 
    image: mealImageMap.get('oatmeal')!,
    ingredients: ['1/2 cup rolled oats', '1 cup water or milk', '1 tbsp honey or maple syrup', 'Toppings: fruits, nuts, seeds'],
    instructions: ['Bring water or milk to a boil.', 'Stir in oats and reduce heat to low.', 'Cook for 5-7 minutes, stirring occasionally.', 'Stir in honey and top with your favorite toppings.'],
    cookTime: '10 minutes',
    nutritionalFacts: { calories: '300', protein: '10g', carbs: '55g', fat: '5g' }
  },
  { 
    id: 'chicken-soup', 
    name: 'Chicken Noodle Soup', 
    description: 'Comforting chicken noodle soup.', 
    image: mealImageMap.get('chicken-soup')!,
    ingredients: ['1 lb chicken breast', '8 cups chicken broth', '2 carrots, chopped', '2 celery stalks, chopped', '4 oz egg noodles'],
    instructions: ['In a large pot, bring chicken broth to a boil.', 'Add chicken and cook until no longer pink.', 'Shred chicken.', 'Add carrots, celery, and noodles, and cook until tender.'],
    cookTime: '40 minutes',
    nutritionalFacts: { calories: '250', protein: '25g', carbs: '20g', fat: '7g' }
  },
  { 
    id: 'club-sandwich', 
    name: 'Club Sandwich', 
    description: 'A classic triple-decker club sandwich.', 
    image: mealImageMap.get('club-sandwich')!,
    ingredients: ['3 slices of bread, toasted', '4 oz turkey, sliced', '2 slices bacon, cooked', 'Lettuce', 'Tomato slices', 'Mayonnaise'],
    instructions: ['Spread mayo on one side of each slice of bread.', 'Layer turkey, bacon, lettuce, and tomato on one slice.', 'Top with a second slice of bread, and repeat layers.', 'Top with the final slice of bread, and secure with toothpicks.', 'Cut into quarters and serve.'],
    cookTime: '15 minutes',
    nutritionalFacts: { calories: '500', protein: '30g', carbs: '45g', fat: '25g' }
  },
  { 
    id: 'sushi-rolls', 
    name: 'Sushi Rolls', 
    description: 'Assorted sushi rolls with wasabi and ginger.', 
    image: mealImageMap.get('sushi-rolls')!,
    ingredients: ['1 cup sushi rice, cooked', '2 sheets nori', 'Fillings: cucumber, avocado, crab or salmon', 'Soy sauce, wasabi, and pickled ginger for serving'],
    instructions: ['Place nori on a bamboo mat.', 'Spread rice evenly over nori.', 'Add fillings in a line across the rice.', 'Roll tightly and slice into pieces.', 'Serve with condiments.'],
    cookTime: '30 minutes (plus time to cook rice)',
    nutritionalFacts: { calories: '300', protein: '10g', carbs: '50g', fat: '5g' }
  },
  { 
    id: 'steak-dinner', 
    name: 'Steak Dinner', 
    description: 'A perfectly cooked steak with potatoes and vegetables.', 
    image: mealImageMap.get('steak-dinner')!,
    ingredients: ['1 large ribeye steak', '1 lb potatoes, quartered', '1 bunch broccoli florets', '2 tbsp olive oil', 'Salt, pepper, and garlic powder'],
    instructions: ['Toss potatoes and broccoli with olive oil and seasonings.', 'Roast at 400°F for 25-30 minutes.', 'Season steak and pan-sear or grill to desired doneness.', 'Let steak rest for 5 minutes before slicing.', 'Serve with roasted vegetables.'],
    cookTime: '40 minutes',
    nutritionalFacts: { calories: '800', protein: '60g', carbs: '50g', fat: '40g' }
  },
];

export const BREAKFAST_MEALS = MEALS.filter(m => ['pancakes', 'scrambled-eggs', 'oatmeal'].includes(m.id));
export const LUNCH_MEALS = MEALS.filter(m => ['quinoa-salad', 'chicken-soup', 'club-sandwich', 'taco-salad'].includes(m.id));
export const DINNER_MEALS = MEALS.filter(m => !BREAKFAST_MEALS.find(bm => bm.id === m.id) && !LUNCH_MEALS.find(lm => lm.id === m.id));

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
  { id: 'caribbean', label: 'Caribbean' },
];

export const ALLERGIES = [
    { id: 'nuts', label: 'Nuts' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'shellfish', label: 'Shellfish' },
    { id: 'soy', label: 'Soy' },
    { id: 'gluten', label: 'Gluten' },
]
