import puppeteer from 'puppeteer';

export async function generatePlanPDF(htmlContent: string, filename: string = 'learning-plan.pdf'): Promise<Buffer> {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.createPage();
    
    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm',
      },
      printBackground: true,
    });

    return pdf;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export function createPlanHTML(data: {
  name: string;
  level: string;
  airport: string;
  professionGoal: string;
  dailyMinutes: number;
  weeklyGoal: number;
  weeks: Array<{
    week: number;
    title: string;
    focus: string[];
    targetPoints: number;
  }>;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1a1a;
      background: white;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #0066cc;
    }
    
    .header p {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    
    .profile {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 40px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .profile-item {
      font-size: 13px;
    }
    
    .profile-item strong {
      color: #0066cc;
      display: block;
      margin-bottom: 5px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h2 {
      font-size: 20px;
      margin-bottom: 20px;
      color: #0066cc;
      border-left: 4px solid #0066cc;
      padding-left: 12px;
    }
    
    .week {
      background: #f9f9f9;
      border-left: 4px solid #0066cc;
      padding: 15px;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    
    .week-header {
      font-size: 14px;
      font-weight: bold;
      color: #0066cc;
      margin-bottom: 8px;
    }
    
    .week-title {
      font-size: 13px;
      margin-bottom: 10px;
      color: #333;
    }
    
    .focus-items {
      font-size: 12px;
      color: #666;
      list-style: none;
      padding-left: 0;
    }
    
    .focus-items li {
      padding: 3px 0;
      padding-left: 20px;
      position: relative;
    }
    
    .focus-items li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #0066cc;
    }
    
    .points {
      font-size: 11px;
      color: #999;
      margin-top: 8px;
      font-weight: 500;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✈️ Your 12-Week Learning Plan</h1>
    <p>Bali's School - Master English for Aviation</p>
    <p>Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    })}</p>
  </div>

  <div class="profile">
    <div class="profile-item">
      <strong>Student Name</strong>
      ${data.name}
    </div>
    <div class="profile-item">
      <strong>English Level</strong>
      ${data.level}
    </div>
    <div class="profile-item">
      <strong>Professional Goal</strong>
      ${data.professionGoal}
    </div>
    <div class="profile-item">
      <strong>Home Airport</strong>
      ${data.airport}
    </div>
    <div class="profile-item">
      <strong>Daily Commitment</strong>
      ${data.dailyMinutes} minutes
    </div>
    <div class="profile-item">
      <strong>Weekly Target</strong>
      ${data.weeklyGoal} hours
    </div>
  </div>

  <div class="section">
    <h2>Your 12-Week Roadmap</h2>
    
    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; font-size: 16px; margin-bottom: 10px;">Weeks 1-4: Foundation Phase</h3>
      <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Build strong fundamentals with basic aviation English vocabulary and common phrases.</p>
    </div>

    ${data.weeks.slice(0, 4).map(week => weekHTML(week)).join('')}
  </div>

  <div class="page-break"></div>

  <div class="section">
    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; font-size: 16px; margin-bottom: 10px;">Weeks 5-8: Intermediate Phase</h3>
      <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Master customer service scenarios and develop confidence in complex conversations.</p>
    </div>

    ${data.weeks.slice(4, 8).map(week => weekHTML(week)).join('')}
  </div>

  <div class="section">
    <div style="margin-bottom: 30px;">
      <h3 style="color: #0066cc; font-size: 16px; margin-bottom: 10px;">Weeks 9-12: Advanced Phase</h3>
      <p style="font-size: 13px; color: #666; margin-bottom: 10px;">Polish your skills with advanced scenarios and comprehensive review for certification readiness.</p>
    </div>

    ${data.weeks.slice(8, 12).map(week => weekHTML(week)).join('')}
  </div>

  <div class="footer">
    <p>This plan is personalized based on your profile and learning goals.</p>
    <p>Follow the weekly modules and earn Kiki Points to track your progress!</p>
  </div>
</body>
</html>
  `;
}

function weekHTML(week: { week: number; title: string; focus: string[]; targetPoints: number }): string {
  return `
    <div class="week">
      <div class="week-header">Week ${week.week}</div>
      <div class="week-title">${week.title}</div>
      <ul class="focus-items">
        ${week.focus.map(item => `<li>${item}</li>`).join('')}
      </ul>
      <div class="points">Target: ${week.targetPoints} Kiki Points</div>
    </div>
  `;
}
