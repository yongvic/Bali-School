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
  const goals30 = data.goals30 || [];
  const goals60 = data.goals60 || [];
  const goals90 = data.goals90 || [];
  const skillFocuses = data.skillFocuses || [];
  const exerciseSuggestions = data.exerciseSuggestions || [];

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Plan d'apprentissage - ${escapeHtml(data.name)}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
      background: #fff;
      color: #1a1a1a;
      line-height: 1.5;
      font-size: 14px;
      overflow-wrap: anywhere;
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .header h1 {
      font-size: 26px;
      color: #0066cc;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 12px;
      color: #444;
    }
    .profile {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      background: #f5f5f5;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid #dde4f0;
      page-break-inside: avoid;
    }
    .profile div {
      font-size: 12px;
    }
    .profile strong {
      display: block;
      color: #0066cc;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      margin-bottom: 4px;
    }
    .section {
      margin-bottom: 22px;
    }
    .section h2 {
      font-size: 18px;
      border-left: 4px solid #0066cc;
      padding-left: 10px;
      color: #0066cc;
      margin-bottom: 10px;
      page-break-after: avoid;
    }
    .goal-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 14px;
    }
    .goal-card {
      background: #f1f5f9;
      border-radius: 10px;
      padding: 12px;
      border: 1px solid #dae8ff;
      page-break-inside: avoid;
    }
    .goal-card h3 {
      color: #0f172a;
      font-size: 15px;
      margin-bottom: 8px;
    }
    .goal-card ul,
    .stack-list {
      padding-left: 16px;
    }
    .goal-card li {
      font-size: 12px;
      color: #1f2933;
      margin-bottom: 4px;
    }
    .list-box {
      background: #f8fafc;
      border: 1px solid #e5edf7;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .stack-list li {
      font-size: 12px;
      margin-bottom: 4px;
      color: #1f2933;
    }
    .week {
      background: #fbfbfb;
      border-left: 4px solid #0066cc;
      padding: 12px 14px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);
      page-break-inside: avoid;
    }
    .week h3 {
      font-size: 15px;
      color: #0f172a;
      margin-bottom: 8px;
    }
    .week ul {
      list-style: disc;
      padding-left: 18px;
      margin-bottom: 8px;
    }
    .week li {
      font-size: 12px;
      color: #3c3c3c;
      margin-bottom: 4px;
    }
    .week p {
      font-size: 12px;
      color: #6b7280;
      margin-top: 6px;
      font-weight: 600;
    }
    .footer {
      font-size: 11px;
      margin-top: 20px;
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
    <p>${escapeHtml(data.name)}</p>
  </div>

  <div class="profile">
    <div>
      <strong>Nom</strong>
      ${escapeHtml(data.name)}
    </div>
    <div>
      <strong>Niveau</strong>
      ${escapeHtml(data.level)}
    </div>
    <div>
      <strong>Objectif pro</strong>
      ${escapeHtml(data.professionGoal)}
    </div>
    <div>
      <strong>Aéroport</strong>
      ${escapeHtml(data.airport)}
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
      ${goalGridHTML('30 jours', goals30)}
      ${goalGridHTML('60 jours', goals60)}
      ${goalGridHTML('90 jours', goals90)}
    </div>
    <h2>Compétences ciblées</h2>
    <div class="list-box">
      <ul class="stack-list">
        ${skillFocuses.map((skill) => `<li>${escapeHtml(skill)}</li>`).join('')}
      </ul>
    </div>
    <h2>Exercices suggérés</h2>
    <div class="list-box">
      <ul class="stack-list">
        ${exerciseSuggestions.map((exercise) => `<li>${escapeHtml(exercise)}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>Feuille de route</h2>
    ${data.weeks
      .map(
        (week) => `
        <div class="week">
          <h3>Semaine ${week.week} · ${escapeHtml(week.title)}</h3>
          <ul>
            ${week.focus.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
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
      <h3>${escapeHtml(label)}</h3>
      <ul>
        ${goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  const linesPerPage = 44;
  const chunks = chunk(lines, linesPerPage);
  const objects: Array<string | undefined> = [];
  let nextId = 4;
  const pageIds: number[] = [];

  objects[1] = `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n`;
  objects[3] = `3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n`;

  chunks.forEach((pageLines) => {
    const pageId = nextId++;
    const contentId = nextId++;
    const content = buildContentStream(pageLines);

    objects[pageId] = `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >> endobj\n`;
    objects[contentId] = `${contentId} 0 obj << /Length ${Buffer.byteLength(content, 'latin1')} >> stream\n${content}\nendstream\nendobj\n`;
    pageIds.push(pageId);
  });

  objects[2] = `2 0 obj << /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >> endobj\n`;

  let body = '';
  const offsets: number[] = [];
  let offset = Buffer.byteLength(header, 'latin1');

  for (let id = 1; id < objects.length; id += 1) {
    const content = objects[id];
    if (!content) continue;
    offsets[id] = offset;
    body += content;
    offset += Buffer.byteLength(content, 'latin1');
  }

  const xrefOffset = Buffer.byteLength(header + body, 'latin1');
  const totalObjects = objects.length;
  const xref = ['xref', `0 ${totalObjects}`, '0000000000 65535 f '];
  for (let id = 1; id < totalObjects; id += 1) {
    xref.push(pad(offsets[id] || 0));
  }

  const trailer = `trailer << /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  const pdf = `${header}${body}${xref.join('\n')}\n${trailer}`;
  return Buffer.from(pdf, 'latin1');
}

function buildContentStream(lines: string[]): string {
  const commands = ['BT', '/F1 16 Tf', '36 806 Td', '16 TL'];
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

function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
