'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plane, Zap, Users, Award } from 'lucide-react';

export default function LandingPage() {
  const { data: session } = useSession();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">Bali&apos;s School</div>
          <div className="flex gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-pretty leading-tight">
              Master English for the Skies
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Gamified English learning platform designed specifically for future flight attendants. Learn through real-world scenarios, earn badges, and track your progress with Kiki Points.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start Learning <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center border border-border">
            <div className="text-6xl">✈️</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-border">
        <h2 className="text-4xl font-bold text-center mb-16">Why Bali&apos;s School?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Plane,
              title: 'Aviation-Focused',
              description: 'Scenarios designed specifically for flight attendant roles and cabin communication.',
            },
            {
              icon: Zap,
              title: 'Gamified Learning',
              description: 'Earn Kiki Points, unlock badges, and compete with other learners for motivation.',
            },
            {
              icon: Award,
              title: 'Personalized Plans',
              description: '30/60/90 day learning plans generated based on your level and goals.',
            },
            {
              icon: Users,
              title: 'Expert Feedback',
              description: 'Submit video exercises and get detailed feedback from expert instructors.',
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
        <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join learners from around the world who are mastering English for aviation careers.
        </p>
        <Link href="/auth/signup">
          <Button size="lg" className="gap-2">
            Get Started Now <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Bali&apos;s School. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
