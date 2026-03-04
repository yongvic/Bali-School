'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      toast.success(data.message || 'Si ce compte existe, un email a été envoyé.');
      if (data?.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch (error) {
      toast.error('Impossible de traiter la demande.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <Button variant="outline" size="sm" onClick={() => window.history.back()} className="w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email. Si un compte existe, vous recevrez un lien de réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </Button>

            <div className="text-sm text-center">
              <Link href="/auth/signin" className="text-primary hover:underline font-semibold">
                Retour à la connexion
              </Link>
            </div>

            {devResetUrl && (
              <div className="text-xs p-3 rounded-lg border bg-muted/50">
                <p className="font-semibold mb-1">Mode développement</p>
                <a href={devResetUrl} className="text-primary hover:underline break-all">
                  Ouvrir le lien de réinitialisation
                </a>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
