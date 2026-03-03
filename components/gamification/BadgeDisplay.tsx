'use client';

import { Card, CardContent } from '@/components/ui/card';

const badgeDefinitions: Record<string, { icon: string; title: string; description: string; condition: string }> = {
  FIRST_EXERCISE: {
    icon: '🎯',
    title: 'First Step',
    description: 'Complete your first exercise',
    condition: 'Complete 1 exercise',
  },
  PRONUNCIATION_STAR: {
    icon: '🌟',
    title: 'Pronunciation Star',
    description: 'Master pronunciation with 5 accent training exercises',
    condition: '5 accent exercises (300 points)',
  },
  CABIN_MASTER: {
    icon: '✈️',
    title: 'Cabin Master',
    description: 'Complete 10 cabin service scenarios',
    condition: '10 passenger service exercises',
  },
  SAFETY_GURU: {
    icon: '🆘',
    title: 'Safety Guru',
    description: 'Practice safety procedures in 5 emergency exercises',
    condition: '5 emergency exercises',
  },
  CONSISTENCY_KING: {
    icon: '👑',
    title: 'Consistency King',
    description: 'Complete exercises for 20 days straight',
    condition: '20 days in a row',
  },
  GRAMMAR_CHAMPION: {
    icon: '📚',
    title: 'Grammar Champion',
    description: 'Master grammar with 3 role-play exercises',
    condition: '3 role-play exercises',
  },
  LISTENING_LEGEND: {
    icon: '👂',
    title: 'Listening Legend',
    description: 'Sharpen listening with 3 listening exercises',
    condition: '3 listening exercises',
  },
  WHEEL_WINNER: {
    icon: '🎡',
    title: 'Wheel Winner',
    description: 'Spin and win 5 wheel of English challenges',
    condition: '5 wheel exercises',
  },
};

interface BadgeDisplayProps {
  badgeType: string;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeDisplay({ badgeType, unlocked, size = 'md' }: BadgeDisplayProps) {
  const badge = badgeDefinitions[badgeType];
  if (!badge) return null;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold transition-all ${
          unlocked
            ? 'bg-yellow-500/20 border-2 border-yellow-500 text-4xl'
            : 'bg-gray-500/10 border-2 border-gray-500/30 text-gray-500 opacity-50 text-3xl'
        }`}
      >
        {unlocked ? badge.icon : '🔒'}
      </div>
      <p className={`font-semibold mt-2 ${textSize[size]}`}>{badge.title}</p>
      <p className={`text-muted-foreground ${textSize[size]} max-w-xs`}>{badge.description}</p>
    </div>
  );
}

interface BadgeGridProps {
  badges: string[];
  unlockedBadges: string[];
}

export function BadgeGrid({ badges, unlockedBadges }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {badges.map(badgeType => (
        <div key={badgeType} className="flex justify-center">
          <BadgeDisplay
            badgeType={badgeType}
            unlocked={unlockedBadges.includes(badgeType)}
            size="md"
          />
        </div>
      ))}
    </div>
  );
}
