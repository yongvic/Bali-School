'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  User,
  Mic,
  WandSparkles,
  CircleDotDashed,
  Theater,
  Ear,
  ShieldAlert,
  Star,
  PenSquare,
  HeartHandshake,
  Briefcase,
  UserX,
  MessageCircleHeart,
} from 'lucide-react';

interface ExerciseCardProps {
  id: string;
  moduleId: string;
  mode: string;
  title: string;
  description: string;
  pointsValue: number;
  completed: boolean;
}

const modeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  PASSENGER: User,
  ACCENT_TRAINING: Mic,
  SECRET_CHALLENGE: WandSparkles,
  WHEEL_OF_ENGLISH: CircleDotDashed,
  ROLE_PLAY: Theater,
  LISTENING: Ear,
  EMERGENCY: ShieldAlert,
  LOVE_AND_ENGLISH: HeartHandshake,
  INTERVIEW_COMPANY: Briefcase,
  LOST_PASSENGER: UserX,
  SPEAKING: MessageCircleHeart,
  CUSTOM: Star,
};

const modeColors: Record<string, string> = {
  PASSENGER: 'bg-blue-500/10 border-blue-500/20',
  ACCENT_TRAINING: 'bg-purple-500/10 border-purple-500/20',
  SECRET_CHALLENGE: 'bg-red-500/10 border-red-500/20',
  WHEEL_OF_ENGLISH: 'bg-yellow-500/10 border-yellow-500/20',
  ROLE_PLAY: 'bg-green-500/10 border-green-500/20',
  LISTENING: 'bg-cyan-500/10 border-cyan-500/20',
  EMERGENCY: 'bg-orange-500/10 border-orange-500/20',
  LOVE_AND_ENGLISH: 'bg-rose-500/10 border-rose-500/20',
  INTERVIEW_COMPANY: 'bg-indigo-500/10 border-indigo-500/20',
  LOST_PASSENGER: 'bg-teal-500/10 border-teal-500/20',
  SPEAKING: 'bg-lime-500/10 border-lime-500/20',
  CUSTOM: 'bg-pink-500/10 border-pink-500/20',
};

export function ExerciseCard({ id, mode, title, description, pointsValue, completed }: ExerciseCardProps) {
  const Icon = modeIcons[mode] || PenSquare;
  const colorClass = modeColors[mode] || 'bg-gray-500/10 border-gray-500/20';

  return (
    <Card className={`border-2 ${colorClass} ${completed ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-7 h-7 text-primary" />
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{mode.replace(/_/g, ' ')}</p>
            </div>
          </div>
          {completed && <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Terminé</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm font-semibold text-primary">{pointsValue} points Kiki</div>
          <Link href={`/learning/exercise/${id}`}>
            <Button size="sm" variant={completed ? 'outline' : 'default'} disabled={completed}>
              {completed ? 'Validé' : 'Démarrer'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
