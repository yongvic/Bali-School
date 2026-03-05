import puppeteer from 'puppeteer';

export interface ValidationPlanWeek {
  week: number;
  title: string;
  focus: string[];
  targetPoints: number;
}

export interface PlanPDFData {
  name: string;
  level: string;
  airport: string;
  professionGoal: string;
  dailyMinutes: number;
  weeklyGoal: number;
  weeks: ValidationPlanWeek[];
  goals30: string[];
  goals60: string[];
  goals90: string[];
  weeklyObjectives: string[];
  skillFocuses: string[];
  exerciseSuggestions: string[];
}

export async function generatePlanPDF(htmlContent: string): Promise<Buffer> {
  let browser;

  try {
    const launchArgs: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      timeout: 120000,
      defaultViewport: { width: 1280, height: 900 },
    };

    if (process.platform === 'linux') {
      launchArgs.args = ['--no-sandbox', '--disable-setuid-sandbox'];
    }

    browser = await puppeteer.launch(launchArgs);
    const page = await browser.newPage();
    page.setDefaultTimeout(120000);
    page.setDefaultNavigationTimeout(120000);

    await page.setContent(htmlContent, {
      waitUntil: ['domcontentloaded', 'networkidle0'],
      timeout: 120000,
    });
    await page.emulateMediaType('print');

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      printBackground: true,
      preferCSSPageSize: true,
    });

    return pdf;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}


export function createPlanHTML(data: PlanPDFData): string {
  const goals30 = data.goals30 || [];
  const goals60 = data.goals60 || [];
  const goals90 = data.goals90 || [];
  const skillFocuses = data.skillFocuses || [];
  const exerciseSuggestions = data.exerciseSuggestions || [];
  const weeklyObjectives = data.weeklyObjectives || [];
  const today = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Plan d'apprentissage - ${escapeHtml(data.name)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    @page {
      size: A4;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif;
      background: #fff;
      color: #1a1a1a;
      line-height: 1.5;
      font-size: 13px;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .container {
      max-width: 100%;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0066cc;
      page-break-inside: avoid;
    }
    .header h1 {
      font-size: 26px;
      color: #0066cc;
      margin-bottom: 4px;
    }
    .header .meta {
      font-size: 11px;
      color: #666;
    }
    .header .name-tag {
      display: inline-block;
      margin-top: 8px;
      background: #0066cc;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      padding: 3px 14px;
      border-radius: 20px;
    }
    .profile {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 24px;
      background: #f4f8ff;
      border: 1px solid #d0e3ff;
      border-radius: 12px;
      padding: 14px;
      page-break-inside: avoid;
    }
    .profile-item strong {
      display: block;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #0066cc;
      margin-bottom: 2px;
    }
    .profile-item span {
      font-size: 12px;
      font-weight: 500;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0066cc;
      border-left: 4px solid #0066cc;
      padding-left: 10px;
      margin-bottom: 12px;
      margin-top: 20px;
      page-break-after: avoid;
    }
    .goal-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .goal-card {
      background: #f8fafc;
      border: 1px solid #d0e3ff;
      border-radius: 10px;
      padding: 12px;
      page-break-inside: avoid;
    }
    .goal-card h3 {
      font-size: 12px;
      font-weight: 700;
      color: #0066cc;
      margin-bottom: 6px;
    }
    .goal-card ul {
      padding-left: 14px;
      list-style: disc;
    }
    .goal-card li {
      font-size: 11px;
      margin-bottom: 3px;
    }
    .list-box {
      background: #f8fafc;
      border: 1px solid #e2eaf5;
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .list-box ul {
      padding-left: 16px;
      list-style: disc;
    }
    .list-box li {
      font-size: 11px;
      margin-bottom: 3px;
    }
    .weekly-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .weekly-item {
      background: #f8fafc;
      border: 1px solid #e2eaf5;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 11px;
      page-break-inside: avoid;
    }
    .weekly-item .week-label {
      font-weight: 700;
      color: #0066cc;
      margin-bottom: 2px;
      font-size: 10px;
    }
    .modules-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .module-card {
      background: #fff;
      border: 1px solid #d0e3ff;
      border-left: 4px solid #0066cc;
      border-radius: 8px;
      padding: 10px 12px;
      page-break-inside: avoid;
    }
    .module-card .week-num {
      font-size: 10px;
      font-weight: 700;
      color: #0066cc;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .module-card .module-title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 3px;
    }
    .module-card .module-desc {
      font-size: 10px;
      color: #555;
      margin-bottom: 4px;
    }
    .module-card .points {
      font-size: 10px;
      font-weight: 600;
      color: #0066cc;
      background: #e8f0fe;
      display: inline-block;
      padding: 1px 6px;
      border-radius: 10px;
    }
    .phase-header {
      background: #e8f0fe;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      color: #0047ab;
      margin-top: 16px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px dashed #ccc;
      font-size: 10px;
      color: #777;
      text-align: center;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Plan d'apprentissage · 12 semaines</h1>
      <div class="meta">Ravi's Aviation English &nbsp;·&nbsp; Généré le ${today}</div>
      <div class="name-tag">${escapeHtml(data.name)}</div>
    </div>

    <div class="profile">
      <div class="profile-item"><strong>Niveau</strong><span>${escapeHtml(data.level)}</span></div>
      <div class="profile-item"><strong>Aéroport</strong><span>${escapeHtml(data.airport)}</span></div>
      <div class="profile-item"><strong>Objectif pro</strong><span>${escapeHtml(data.professionGoal)}</span></div>
      <div class="profile-item"><strong>Routine</strong><span>${data.dailyMinutes} min / jour</span></div>
      <div class="profile-item"><strong>Objectif hebdo</strong><span>${data.weeklyGoal} h</span></div>
    </div>

    <div class="section-title">Objectifs 30 / 60 / 90 jours</div>
    <div class="goal-grid">
      ${goalCardHTML('30 jours', goals30)}
      ${goalCardHTML('60 jours', goals60)}
      ${goalCardHTML('90 jours', goals90)}
    </div>

    ${skillFocuses.length > 0 ? `
      <div class="section-title">Compétences à maîtriser</div>
      <div class="list-box">
        <ul>${skillFocuses.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
      </div>
    ` : ''}

    ${exerciseSuggestions.length > 0 ? `
      <div class="section-title">Exercices suggérés</div>
      <div class="list-box">
        <ul>${exerciseSuggestions.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
      </div>
    ` : ''}

    ${weeklyObjectives.length > 0 ? `
      <div class="section-title">Objectifs hebdomadaires</div>
      <div class="weekly-grid">
        ${weeklyObjectives.map((obj, i) => `
          <div class="weekly-item">
            <div class="week-label">Semaine ${i + 1}</div>
            <div>${escapeHtml(obj)}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <div class="section-title">Feuille de route — 12 semaines</div>
    ${renderPhases(data)}

    <div class="footer">
      Ce plan est personnalisé selon votre profil. Ravi's Aviation English &nbsp;·&nbsp; ${today}
    </div>
  </div>
</body>
</html>
  `;
}

function goalCardHTML(label: string, goals: string[]): string {
  if (!goals || goals.length === 0) return '';
  return `
    <div class="goal-card">
      <h3>${escapeHtml(label)}</h3>
      <ul>${goals.map(g => `<li>${escapeHtml(g)}</li>`).join('')}</ul>
    </div>
  `;
}

function renderPhases(data: PlanPDFData): string {
  const phases = [
    { label: 'Phase Fondation', weeks: [1, 2, 3, 4] },
    { label: 'Phase Intermédiaire', weeks: [5, 6, 7, 8] },
    { label: 'Phase Avancée', weeks: [9, 10, 11, 12] },
  ];

  return phases.map(phase => {
    const phaseModules = data.weeks.filter(w => phase.weeks.includes(w.week));
    if (phaseModules.length === 0) return '';
    return `
      <div class="phase-header">${phase.label} · Semaines ${phase.weeks[0]}–${phase.weeks[phase.weeks.length - 1]}</div>
      <div class="modules-grid">
        ${phaseModules.map(mod => `
          <div class="module-card">
            <div class="week-num">Semaine ${mod.week}</div>
            <div class="module-title">${escapeHtml(mod.title)}</div>
            <div class="module-desc">Focus : ${escapeHtml(mod.focus.join(', '))}</div>
            <span class="points">${mod.targetPoints} pts Kiki</span>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}



function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
