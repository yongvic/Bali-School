'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type OnboardingStep = 'profession' | 'level' | 'availability' | 'airport' | 'challenges' | 'review';

interface OnboardingData {
  professionGoal: string;
  englishLevel: string;
  dailyMinutes: string;
  weeklyGoal: string;
  airportCode: string;
  airportName: string;
  challenges: string[];
  motivation: string;
}

const ENGLISH_LEVELS = [
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate' },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
  { value: 'C2', label: 'C2 - Mastery' },
];

const CHALLENGE_OPTIONS = [
  'Pronunciation',
  'Listening Comprehension',
  'Vocabulary',
  'Grammar',
  'Confidence Speaking',
  'Accent',
  'Business English',
  'Emergency Procedures',
];

const AIRPORTS = [
  { code: 'CGK', name: 'Jakarta (Soekarno-Hatta)' },
  { code: 'DPS', name: 'Denpasar (Ngurah Rai)' },
  { code: 'SUB', name: 'Surabaya (Juanda)' },
  { code: 'SIN', name: 'Singapore (Changi)' },
  { code: 'KUL', name: 'Kuala Lumpur (KLIA)' },
  { code: 'BKK', name: 'Bangkok (Suvarnabhumi)' },
  { code: 'HAN', name: 'Hanoi (Noi Bai)' },
  { code: 'HCM', name: 'Ho Chi Minh City (Tan Son Nhat)' },
];

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profession');
  const [data, setData] = useState<OnboardingData>({
    professionGoal: 'future flight attendant',
    englishLevel: 'B1',
    dailyMinutes: '30',
    weeklyGoal: '5',
    airportCode: 'CGK',
    airportName: 'Jakarta (Soekarno-Hatta)',
    challenges: [],
    motivation: '',
  });

  const steps: OnboardingStep[] = ['profession', 'level', 'availability', 'airport', 'challenges', 'review'];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleChallengeToggle = (challenge: string) => {
    setData(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  };

  const handleSubmit = async () => {
    if (!data.motivation.trim()) {
      toast.error('Please share your motivation');
      return;
    }

    onComplete(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <Card>
        <CardHeader>
          {currentStep === 'profession' && (
            <>
              <CardTitle>Your Professional Goal</CardTitle>
            </>
          )}
          {currentStep === 'level' && (
            <>
              <CardTitle>Your English Level</CardTitle>
            </>
          )}
          {currentStep === 'availability' && (
            <>
              <CardTitle>Your Availability</CardTitle>
            </>
          )}
          {currentStep === 'airport' && (
            <>
              <CardTitle>Your Home Airport</CardTitle>
            </>
          )}
          {currentStep === 'challenges' && (
            <>
              <CardTitle>Learning Challenges</CardTitle>
            </>
          )}
          {currentStep === 'review' && (
            <>
              <CardTitle>Review Your Profile</CardTitle>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 'profession' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What's your professional goal?</Label>
                <Input
                  value={data.professionGoal}
                  onChange={(e) => setData({ ...data, professionGoal: e.target.value })}
                  placeholder="e.g., Become a flight attendant"
                  className="text-base"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Tell us what position or role you're aiming for in aviation.
              </p>
            </div>
          )}

          {currentStep === 'level' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What's your current English level?</Label>
                <Select value={data.englishLevel} onValueChange={(value) => setData({ ...data, englishLevel: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGLISH_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                This helps us tailor exercises to your level.
              </p>
            </div>
          )}

          {currentStep === 'availability' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>How many minutes can you dedicate daily?</Label>
                <Input
                  type="number"
                  value={data.dailyMinutes}
                  onChange={(e) => setData({ ...data, dailyMinutes: e.target.value })}
                  placeholder="30"
                  min="5"
                  max="480"
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label>Target hours per week</Label>
                <Input
                  type="number"
                  value={data.weeklyGoal}
                  onChange={(e) => setData({ ...data, weeklyGoal: e.target.value })}
                  placeholder="5"
                  min="1"
                  max="40"
                  className="text-base"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your answers will shape your personalized 30/60/90 day plan.
              </p>
            </div>
          )}

          {currentStep === 'airport' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Which is your home airport?</Label>
                <Select value={data.airportCode} onValueChange={(value) => {
                  const selected = AIRPORTS.find(a => a.code === value);
                  if (selected) {
                    setData({ ...data, airportCode: selected.code, airportName: selected.name });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AIRPORTS.map(airport => (
                      <SelectItem key={airport.code} value={airport.code}>
                        {airport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Your airport will be the starting point of your learning journey map.
              </p>
            </div>
          )}

          {currentStep === 'challenges' && (
            <div className="space-y-4">
              <Label>What are your main challenges? (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3">
                {CHALLENGE_OPTIONS.map(challenge => (
                  <button
                    key={challenge}
                    onClick={() => handleChallengeToggle(challenge)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      data.challenges.includes(challenge)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{challenge}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                We'll focus on your pain points in the learning plan.
              </p>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Professional Goal</p>
                  <p className="font-semibold text-lg">{data.professionGoal}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">English Level</p>
                    <p className="font-semibold text-lg">{data.englishLevel}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Daily Commitment</p>
                    <p className="font-semibold text-lg">{data.dailyMinutes} min</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Weekly Goal</p>
                    <p className="font-semibold text-lg">{data.weeklyGoal}h</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Home Airport</p>
                    <p className="font-semibold text-lg">{data.airportCode}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Challenges</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.challenges.map(c => (
                      <span key={c} className="px-2 py-1 rounded bg-primary/20 text-primary text-sm font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want to learn English?</Label>
                <textarea
                  id="motivation"
                  value={data.motivation}
                  onChange={(e) => setData({ ...data, motivation: e.target.value })}
                  placeholder="Share your motivation..."
                  className="w-full p-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            {currentIndex === steps.length - 1 ? (
              <Button onClick={handleSubmit} className="flex-1">
                Generate My Plan
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
