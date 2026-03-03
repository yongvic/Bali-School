'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Download, Calendar, Target } from 'lucide-react';

interface Module {
  week: number;
  title: string;
  description: string;
  targetPoints: number;
}

interface LearningPlan {
  id: string;
  weeklyFocus: string[];
  estimatedCompletion: string;
  modules: Module[];
}

export default function LearningPlanPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/learning-plan');
        if (!response.ok) {
          throw new Error('Failed to fetch learning plan');
        }
        const data = await response.json();
        setPlan(data);
      } catch (error) {
        toast.error('Failed to load your learning plan');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, []);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/learning-plan/download-pdf');
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'learning-plan.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Plan downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Loading Your Plan...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>No Plan Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Complete your onboarding to generate a personalized learning plan.
            </p>
            <Button onClick={() => redirect('/onboarding')} className="w-full">
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Your 12-Week Learning Plan</h1>
              <p className="text-lg text-muted-foreground">
                Master English for Aviation - Personalized roadmap
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>

          {searchParams.get('generated') === 'true' && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
              ✓ Your personalized plan has been generated!
            </div>
          )}
        </div>

        {/* Plan Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12 Weeks</p>
              <p className="text-sm text-muted-foreground">
                Completion by {new Date(new Date(plan.estimatedCompletion).getTime()).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Weekly Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3,000+</p>
              <p className="text-sm text-muted-foreground">Kiki Points to earn</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                ✈️ Modules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{plan.modules.length}</p>
              <p className="text-sm text-muted-foreground">Weekly learning modules</p>
            </CardContent>
          </Card>
        </div>

        {/* Phases */}
        <div className="space-y-8">
          {[
            {
              phase: 'Foundation',
              weeks: '1-4',
              description: 'Build strong fundamentals with basic aviation English vocabulary and common phrases.',
              color: 'bg-blue-500/10 border-blue-500/20',
            },
            {
              phase: 'Intermediate',
              weeks: '5-8',
              description: 'Master customer service scenarios and develop confidence in complex conversations.',
              color: 'bg-purple-500/10 border-purple-500/20',
            },
            {
              phase: 'Advanced',
              weeks: '9-12',
              description: 'Polish your skills with advanced scenarios and comprehensive review for certification readiness.',
              color: 'bg-amber-500/10 border-amber-500/20',
            },
          ].map((phase, idx) => (
            <div key={idx}>
              <div className={`p-4 rounded-lg border ${phase.color} mb-4`}>
                <h3 className="text-lg font-semibold mb-2">{phase.phase} Phase (Weeks {phase.weeks})</h3>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.modules
                  .filter(m => {
                    const weekNum = m.week;
                    if (phase.weeks === '1-4') return weekNum >= 1 && weekNum <= 4;
                    if (phase.weeks === '5-8') return weekNum >= 5 && weekNum <= 8;
                    return weekNum >= 9 && weekNum <= 12;
                  })
                  .map(module => (
                    <Card key={module.week}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Week {module.week}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm font-medium text-foreground">{module.title}</p>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs font-semibold text-primary">
                            Target: {module.targetPoints} Kiki Points
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🚀</span> Ready to Get Started?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your personalized plan is ready. Start with Week 1 and progress through the modules
              to earn Kiki Points and unlock badges.
            </p>
            <Button size="lg" className="w-full gap-2">
              Begin Week 1 <span>→</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
