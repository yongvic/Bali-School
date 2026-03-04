'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plane, Zap, Users, Award } from 'lucide-react';

export default function LandingPage() {
  const sessionState = useSession();
  const session = sessionState?.data;

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Image src="/logo.svg" alt="Ravi's" width={132} height={32} className="h-8 w-auto max-w-[132px] md:h-7 md:max-w-[122px]" priority />
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Commencer</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-pretty leading-tight">
              Maîtrisez l&apos;anglais pour le personnel cabine
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Plateforme française pour apprendre l&apos;anglais aéronautique avec des mises en situation réalistes, des badges et un suivi de progression.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Démarrer l&apos;apprentissage <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center border border-border">
            <Plane className="w-24 h-24 text-primary/70" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-border">
        <h2 className="text-4xl font-bold text-center mb-16">Pourquoi Ravi&apos;s ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Plane,
              title: 'Orienté aviation',
              description: 'Scénarios conçus pour les métiers cabine et la communication à bord.',
            },
            {
              icon: Zap,
              title: 'Apprentissage gamifié',
              description: 'Gagnez des points Kiki, débloquez des badges et maintenez votre motivation.',
            },
            {
              icon: Award,
              title: 'Parcours personnalisés',
              description: 'Plans 30/60/90 jours adaptés à votre niveau et à vos objectifs.',
            },
            {
              icon: Users,
              title: 'Feedback expert',
              description: 'Envoyez vos vidéos et recevez des retours détaillés de formateurs.',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="p-6 rounded-xl border border-border bg-card hover:bg-accent/5 transition-colors">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-border text-center">
        <h2 className="text-4xl font-bold mb-6">Prêt(e) à commencer ?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Rejoignez une formation professionnelle en anglais dédiée aux métiers de l&apos;aérien.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="gap-2">
            Commencer maintenant <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Ravi&apos;s. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}


