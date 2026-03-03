'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ALL_BADGES = [
  { name: 'First Exercise', emoji: '🎯', unlocked: false },
  { name: 'Pronunciation Star', emoji: '⭐', unlocked: false },
  { name: 'Cabin Master', emoji: '🛫', unlocked: false },
  { name: 'Safety Guru', emoji: '🛡️', unlocked: false },
  { name: 'Consistency King', emoji: '👑', unlocked: false },
  { name: 'Grammar Champion', emoji: '📚', unlocked: false },
  { name: 'Listening Legend', emoji: '👂', unlocked: false },
  { name: 'Wheel Winner', emoji: '🎡', unlocked: false },
];

export default function GamificationPage() {
  const { data: session } = useSession();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Achievements</h1>
          <p className="text-lg text-muted-foreground">Earn Kiki Points and unlock badges</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🔥</div>
                <div>
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-3xl font-bold">0 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="text-4xl">⭐</div>
                <div>
                  <p className="text-sm text-muted-foreground">Badges</p>
                  <p className="text-3xl font-bold">0/8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ALL_BADGES.map((badge) => (
                <div key={badge.name} className={`p-6 rounded-lg border-2 text-center ${badge.unlocked ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700 opacity-50'}`}>
                  <div className="text-5xl mb-2">{badge.emoji}</div>
                  <h3 className="font-semibold mb-1">{badge.name}</h3>
                  {badge.unlocked ? (
                    <Badge>Unlocked</Badge>
                  ) : (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Points Breakdown */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Earn Points</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <span>Complete an Exercise</span>
              <span className="font-bold text-blue-600">+50-75 pts</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <span>Submit a Video</span>
              <span className="font-bold text-purple-600">+20 pts</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <span>Unlock a Badge</span>
              <span className="font-bold text-yellow-600">+100 pts</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <span>Daily Streak Bonus</span>
              <span className="font-bold text-green-600">+10 pts/day</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
