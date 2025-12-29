import { jsPDF } from 'jspdf';
import { type Recipe } from '@/ai/flows/generate-recipes-from-pantry';
import { type Meal } from './data';

function generatePdf(recipe: Recipe | Meal) {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(22);
    doc.text(recipe.name, 105, 20, { align: 'center' });

    // Add description
    doc.setFontSize(12);
    const descriptionLines = doc.splitTextToSize(recipe.description, 180);
    doc.text(descriptionLines, 105, 30, { align: 'center' });

    let yPosition = 50;

    // Add Ingredients
    doc.setFontSize(16);
    doc.text('Ingredients', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(11);
    recipe.ingredients.forEach(ingredient => {
        doc.text(`• ${ingredient}`, 25, yPosition);
        yPosition += 7;
    });

    yPosition += 5;

    // Add Instructions
    doc.setFontSize(16);
    doc.text('Instructions', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(11);
    recipe.instructions.forEach((instruction, index) => {
        const instructionText = `${index + 1}. ${instruction}`;
        const instructionLines = doc.splitTextToSize(instructionText, 165);
        doc.text(instructionLines, 25, yPosition);
        yPosition += (instructionLines.length * 5) + 5;
        if (yPosition > 280) { // Check if we need a new page
            doc.addPage();
            yPosition = 20;
        }
    });

    yPosition += 5;
    
    // Add Cook Time
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cook Time:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(recipe.cookTime, 50, yPosition);
    yPosition += 10;

    // Add Nutritional Facts
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Nutritional Facts:', 20, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Calories: ${recipe.nutritionalFacts.calories}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Protein: ${recipe.nutritionalFacts.protein}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Carbs: ${recipe.nutritionalFacts.carbs}`, 25, yPosition);
    yPosition += 7;
    doc.text(`Fat: ${recipe.nutritionalFacts.fat}`, 25, yPosition);

    return doc;
}


export function handleDownload(recipe: Recipe | Meal) {
    const doc = generatePdf(recipe);
    const fileName = `${recipe.name.toLowerCase().replace(/\s/g, '-')}.pdf`;
    doc.save(fileName);
}
