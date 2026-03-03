'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ExerciseCardProps {
  id: string;
  moduleId: string;
  mode: string;
  title: string;
  description: string;
  pointsValue: number;
  completed: boolean;
}

const modeIcons: Record<string, string> = {
  PASSENGER: '👤',
  ACCENT_TRAINING: '🎤',
  SECRET_CHALLENGE: '🎭',
  WHEEL_OF_ENGLISH: '🎡',
  ROLE_PLAY: '🎬',
  LISTENING: '👂',
  EMERGENCY: '🆘',
  CUSTOM: '⭐',
};

const modeColors: Record<string, string> = {
  PASSENGER: 'bg-blue-500/10 border-blue-500/20',
  ACCENT_TRAINING: 'bg-purple-500/10 border-purple-500/20',
  SECRET_CHALLENGE: 'bg-red-500/10 border-red-500/20',
  WHEEL_OF_ENGLISH: 'bg-yellow-500/10 border-yellow-500/20',
  ROLE_PLAY: 'bg-green-500/10 border-green-500/20',
  LISTENING: 'bg-cyan-500/10 border-cyan-500/20',
  EMERGENCY: 'bg-orange-500/10 border-orange-500/20',
  CUSTOM: 'bg-pink-500/10 border-pink-500/20',
};

export function ExerciseCard({
  id,
  moduleId,
  mode,
  title,
  description,
  pointsValue,
  completed,
}: ExerciseCardProps) {
  const icon = modeIcons[mode] || '📝';
  const colorClass = modeColors[mode] || 'bg-gray-500/10 border-gray-500/20';

  return (
    <Card className={`border-2 ${colorClass} ${completed ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{icon}</div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {mode.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          {completed && (
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
              ✓ Done
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm font-semibold text-primary">
            {pointsValue} Kiki Points
          </div>
          <Link href={`/learning/exercise/${id}`}>
            <Button 
              size="sm" 
              variant={completed ? 'outline' : 'default'}
              disabled={completed}
            >
              {completed ? 'Completed' : 'Start'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
