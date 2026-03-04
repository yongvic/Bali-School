interface ResetEmailPayload {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, resetUrl }: ResetEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.log(`[Password Reset] Email provider not configured. Reset URL for ${to}: ${resetUrl}`);
    return { delivered: false as const, reason: 'provider_not_configured' as const };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color:#1f2937; line-height:1.5;">
      <h2>Ravi's - Réinitialisation du mot de passe</h2>
      <p>Vous avez demandé une réinitialisation de mot de passe.</p>
      <p>Cliquez sur le bouton ci-dessous (valable 1 heure) :</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block; background:#2563eb; color:white; padding:10px 16px; border-radius:6px; text-decoration:none;">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    </div>
  `;

  const text = [
    "Ravi's - Réinitialisation du mot de passe",
    'Vous avez demandé une réinitialisation de mot de passe.',
    `Lien (valable 1 heure): ${resetUrl}`,
    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Ravi's - Réinitialisation du mot de passe",
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error: ${response.status} ${body}`);
  }

  return { delivered: true as const };
}
