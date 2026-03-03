'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/learning/ProgressBar';

interface KikiPointsDisplayProps {
  totalPoints: number;
  weeklyPoints: number;
  weeklyGoal?: number;
  showWeekly?: boolean;
}

export function KikiPointsDisplay({
  totalPoints,
  weeklyPoints,
  weeklyGoal = 300,
  showWeekly = true,
}: KikiPointsDisplayProps) {
  const weeklyProgress = (weeklyPoints / weeklyGoal) * 100;

  return (
    <div className="space-y-4">
      {/* Total Points Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Total Kiki Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-5xl font-bold text-primary">{totalPoints.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
              Keep learning to earn more points
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Points Card */}
      {showWeekly && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">This Week's Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{weeklyPoints.toLocaleString()} / {weeklyGoal}</span>
                <span className="text-sm font-semibold text-primary">
                  {Math.round(weeklyProgress)}%
                </span>
              </div>
              <ProgressBar progress={weeklyProgress} showLabel={false} />
            </div>

            {weeklyProgress >= 100 ? (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-700 dark:text-green-400">
                  🎉 Weekly goal achieved! Great consistency!
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {weeklyGoal - weeklyPoints} points remaining this week
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
