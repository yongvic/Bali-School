import { generatePlanPDF, generateFallbackPlanPDF, createPlanHTML } from './lib/pdf-generator';

const planData = {
    name: 'Apprenant Test',
    level: 'Débutant',
    airport: 'CDG',
    professionGoal: 'Agent',
    dailyMinutes: 30,
    weeklyGoal: 5,
    goals30: ['Goal 1', 'Goal 2'],
    goals60: ['Goal 3'],
    goals90: ['Goal 4'],
    weeklyObjectives: [],
    skillFocuses: ['Speaking'],
    exerciseSuggestions: ['Flashcards'],
    weeks: [
        {
            week: 1,
            title: 'Semaine Test',
            focus: ['Focus 1', 'Focus 2'],
            targetPoints: 100
        }
    ]
};

async function test() {
    const html = createPlanHTML(planData);
    try {
        console.log('Generating PDF with Puppeteer...');
        const pdf = await generatePlanPDF(html);
        console.log('Puppeteer success, PDF byte length:', pdf.length);
    } catch (err) {
        console.error('Puppeteer generation failed:', err);
        console.log('Falling back to basic PDF...');
        const fallback = generateFallbackPlanPDF(planData);
        console.log('Fallback length:', fallback.length);
    }
}

test();
