'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, LogOut, ArrowRight, Trophy, Target, Calendar } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: stats, isLoading } = useSWR(`/api/dashboard/stats`, fetcher);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, redirectUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✈️</div>
            <div>
              <h1 className="text-2xl font-bold">Bali&apos;s School</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Welcome,</p>
              <p className="font-semibold">{session.user.name}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Role Badge & Quick Stats */}
          <div className="flex gap-4 flex-wrap">
            <div className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {session.user.role === 'ADMIN' ? '👨‍💼 Admin' : '👩‍🎓 Student'}
            </div>
            {!isLoading && stats && (
              <>
                <div className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-700 font-semibold text-sm">
                  🏆 {stats.totalPoints} Points
                </div>
                <div className="px-4 py-2 rounded-full bg-green-500/10 text-green-700 font-semibold text-sm">
                  📈 {stats.badgesUnlocked} Badges
                </div>
              </>
            )}
          </div>

          {/* Welcome Section */}
          <div>
            <h2 className="text-4xl font-bold mb-4">Welcome to Your Learning Dashboard</h2>
            <p className="text-lg text-muted-foreground">
              This is a placeholder for the full dashboard. We&apos;re building your personalized learning experience.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Learning Plan',
                description: 'Your 12-week customized English learning path',
                icon: '📋',
                action: () => router.push('/learning-plan'),
                buttonText: 'View Plan',
              },
              {
                title: 'Start Learning',
                description: 'Complete interactive exercises and earn Kiki Points',
                icon: '🎯',
                action: () => router.push('/learn'),
                buttonText: 'Begin',
              },
              {
                title: 'Submit Video',
                description: 'Record and submit English practice videos for feedback',
                icon: '📹',
                action: () => router.push('/submit-video'),
                buttonText: 'Submit',
              },
              {
                title: 'Achievements',
                description: 'Earn Kiki Points and unlock achievement badges',
                icon: '🏆',
                action: () => router.push('/gamification'),
                buttonText: 'View Badges',
              },
              {
                title: 'My Progress',
                description: 'Track your learning journey and stats',
                icon: '📊',
                action: () => router.push('/progress'),
                buttonText: 'View Stats',
              },
              {
                title: 'Help & Support',
                description: 'Get answers to common questions',
                icon: '💬',
                action: () => router.push('/support'),
                buttonText: 'Get Help',
              },
            ].map((item, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={item.action}
                    className="w-full"
                  >
                    {item.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {session.user.role === 'STUDENT' && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🚀</span> Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Start your journey by completing your onboarding to get a personalized learning plan!
                </p>
                <Button className="gap-2" onClick={() => router.push('/onboarding')}>
                  <span>Begin Onboarding</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {session.user.role === 'ADMIN' && (
            <Card className="border-2 border-amber-500/20 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>⚙️</span> Admin Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Access admin tools to review student submissions, manage content, and monitor progress.
                </p>
                <Button variant="outline" className="gap-2" onClick={() => router.push('/admin')}>
                  <span>Go to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
