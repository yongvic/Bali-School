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
      timeout: 60000,
      defaultViewport: { width: 1280, height: 720 },
    };

    if (process.platform === 'linux') {
      launchArgs.args = ['--no-sandbox', '--disable-setuid-sandbox'];
    }

    browser = await puppeteer.launch(launchArgs);
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);

    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
      printBackground: true,
      timeout: 60000,
    });

    return pdf;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function generateFallbackPlanPDF(data: PlanPDFData): Uint8Array {
  const lines = buildTextLines(data);
  return buildPDF(lines);
}

export function createPlanHTML(data: PlanPDFData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Plan d'apprentissage - ${data.name}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
      background: #fff;
      color: #1a1a1a;
      padding: 40px;
      line-height: 1.5;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 32px;
      color: #0066cc;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 12px;
      color: #444;
    }
    .profile {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      background: #f5f5f5;
      padding: 24px;
      border-radius: 14px;
      margin-bottom: 36px;
      border: 1px solid #dde4f0;
    }
    .profile div {
      font-size: 12px;
    }
    .profile strong {
      display: block;
      color: #0066cc;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      margin-bottom: 4px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 20px;
      border-left: 4px solid #0066cc;
      padding-left: 12px;
      color: #0066cc;
      margin-bottom: 14px;
    }
    .goal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 20px;
    }
    .goal-card {
      background: #f1f5f9;
      border-radius: 10px;
      padding: 16px;
      border: 1px solid #dae8ff;
      min-height: 160px;
    }
    .goal-card h3 {
      color: #0f172a;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .goal-card li {
      font-size: 13px;
      color: #1f2933;
      margin-bottom: 6px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip {
      background: #e0f2fe;
      border-radius: 999px;
      padding: 6px 12px;
      color: #0369a1;
      font-size: 12px;
    }
    .week {
      background: #fbfbfb;
      border-left: 4px solid #0066cc;
      padding: 14px 18px;
      border-radius: 8px;
      margin-bottom: 16px;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);
    }
    .week h3 {
      font-size: 16px;
      color: #0f172a;
      margin-bottom: 10px;
    }
    .week ul {
      list-style: none;
      padding-left: 0;
      margin-bottom: 10px;
    }
    .week li {
      font-size: 12px;
      color: #3c3c3c;
      margin-bottom: 4px;
      padding-left: 18px;
      position: relative;
    }
    .week li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #0066cc;
    }
    .week p {
      font-size: 12px;
      color: #6b7280;
      margin-top: 6px;
      font-weight: 600;
    }
    .footer {
      font-size: 11px;
      margin-top: 30px;
      color: #555;
      border-top: 1px dashed #d6d6d6;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Plan d'apprentissage sur 12 semaines</h1>
    <p>Ravi's • Généré le ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <p>${data.name}</p>
  </div>

  <div class="profile">
    <div>
      <strong>Nom</strong>
      ${data.name}
    </div>
    <div>
      <strong>Niveau</strong>
      ${data.level}
    </div>
    <div>
      <strong>Objectif pro</strong>
      ${data.professionGoal}
    </div>
    <div>
      <strong>Aéroport</strong>
      ${data.airport}
    </div>
    <div>
      <strong>Routine</strong>
      ${data.dailyMinutes} min / jour
    </div>
    <div>
      <strong>Objectif hebdo</strong>
      ${data.weeklyGoal} h
    </div>
  </div>

  <div class="section">
    <h2>Objectifs 30 / 60 / 90 jours</h2>
    <div class="goal-grid">
      ${goalGridHTML('30 jours', data.goals30)}
      ${goalGridHTML('60 jours', data.goals60)}
      ${goalGridHTML('90 jours', data.goals90)}
    </div>
    <h2>Compétences ciblées</h2>
    <div class="chips">
      ${data.skillFocuses.map((skill) => `<span class="chip">${skill}</span>`).join('')}
    </div>
    <h2>Exercices suggérés</h2>
    <div class="chips">
      ${data.exerciseSuggestions.map((exercise) => `<span class="chip">${exercise}</span>`).join('')}
    </div>
  </div>

  <div class="section">
    <h2>Feuille de route</h2>
    ${data.weeks
      .map(
        (week) => `
        <div class="week">
          <h3>Semaine ${week.week} · ${week.title}</h3>
          <ul>
            ${week.focus.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          <p>Objectif: ${week.targetPoints} points Kiki</p>
        </div>
      `
      )
      .join('')}
  </div>

  <div class="footer">
    <p>
      Ce plan est adapté à votre profil. Chaque semaine, vérifiez les focus et cumulez des points Kiki pour suivre
      votre progression dans les modules.
    </p>
  </div>
</body>
</html>
`;
}

function goalGridHTML(label: string, goals: string[]): string {
  if (!goals || goals.length === 0) return '';
  return `
    <div class="goal-card">
      <h3>${label}</h3>
      <ul>
        ${goals.map((goal) => `<li>${goal}</li>`).join('')}
      </ul>
    </div>
  `;
}

function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function buildTextLines(data: PlanPDFData): string[] {
  const lines: string[] = [];
  lines.push('Plan d’apprentissage sur 12 semaines');
  lines.push('');
  lines.push(`Nom : ${data.name}`);
  lines.push(`Niveau : ${data.level}`);
  lines.push(`Objectif pro : ${data.professionGoal}`);
  lines.push(`Aéroport : ${data.airport}`);
  lines.push(`Temps quotidien : ${data.dailyMinutes} min`);
  lines.push(`Objectif hebdo : ${data.weeklyGoal} h`);
  lines.push('');
  lines.push('Feuille de route');

  data.weeks.forEach((week) => {
    lines.push('');
    lines.push(`Semaine ${week.week} · ${week.title}`);
    wrapText(week.focus.join(' • '), 80).forEach((line) => lines.push(line));
    lines.push(`Objectif : ${week.targetPoints} points Kiki`);
  });

  lines.push('');
  lines.push('Ce plan est personnalisé selon votre profil. Revoyez les focus chaque semaine.');
  return lines;
}

function buildPDF(lines: string[]): Uint8Array {
  const header = '%PDF-1.4\n';
  let body = '';
  const objects: { id: number; content: string }[] = [];
  let offset = header.length;

  const content = buildContentStream(lines);
  objects.push({ id: 1, content: `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n` });
  objects.push({ id: 2, content: `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n` });
  objects.push({
    id: 3,
    content: `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n`,
  });
  objects.push({ id: 4, content: `4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n` });
  objects.push({
    id: 5,
    content: `5 0 obj << /Length ${Buffer.byteLength(content)} >> stream\n${content}\nendstream\nendobj\n`,
  });

  const offsets: number[] = [];
  objects.forEach((obj) => {
    offsets.push(offset);
    body += obj.content;
    offset += obj.content.length;
  });

  const xrefOffset = header.length + body.length;
  const xref = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f '];
  offsets.forEach((off) => xref.push(pad(off)));

  const trailer = `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const pdf = header + body + xref.join('\n') + '\n' + trailer;
  return Buffer.from(pdf, 'latin1');
}

function buildContentStream(lines: string[]): string {
  const commands = ['BT', '/F1 16 Tf', '36 806 Td', '16 TL'];
  let currentY = 0;
  lines.forEach((line, index) => {
    if (index > 0) {
      commands.push('T*');
    }
    commands.push(`(${escapePDF(line)}) Tj`);
  });
  commands.push('ET');
  return commands.join('\n');
}

function escapePDF(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function pad(value: number): string {
  return `${value}`.padStart(10, '0') + ' 00000 n ';
}
