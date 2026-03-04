'use client';

import { useState } from 'react';
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
  { value: 'A1', label: 'A1 - Débutant' },
  { value: 'A2', label: 'A2 - Élémentaire' },
  { value: 'B1', label: 'B1 - Intermédiaire' },
  { value: 'B2', label: 'B2 - Intermédiaire avancé' },
  { value: 'C1', label: 'C1 - Avancé' },
  { value: 'C2', label: 'C2 - Maîtrise' },
];

const CHALLENGE_OPTIONS = [
  'Prononciation',
  'Compréhension orale',
  'Vocabulaire',
  'Grammaire',
  'Confiance à l’oral',
  'Accent',
  'Business English',
  'Procédures d’urgence',
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
      toast.error('Veuillez indiquer votre motivation.');
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
            Étape {currentIndex + 1} sur {steps.length}
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
              <CardTitle>Objectif professionnel</CardTitle>
            </>
          )}
          {currentStep === 'level' && (
            <>
              <CardTitle>Niveau d&apos;anglais</CardTitle>
            </>
          )}
          {currentStep === 'availability' && (
            <>
              <CardTitle>Disponibilité</CardTitle>
            </>
          )}
          {currentStep === 'airport' && (
            <>
              <CardTitle>Aéroport principal</CardTitle>
            </>
          )}
          {currentStep === 'challenges' && (
            <>
              <CardTitle>Défis d&apos;apprentissage</CardTitle>
            </>
          )}
          {currentStep === 'review' && (
            <>
              <CardTitle>Récapitulatif du profil</CardTitle>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 'profession' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quel est votre objectif professionnel ?</Label>
                <Input
                  value={data.professionGoal}
                  onChange={(e) => setData({ ...data, professionGoal: e.target.value })}
                  placeholder="Ex: Devenir personnel navigant commercial"
                  className="text-base"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Indiquez le poste visé dans l’aviation.
              </p>
            </div>
          )}

          {currentStep === 'level' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quel est votre niveau actuel en anglais ?</Label>
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
                Cette information adapte les modules à votre niveau.
              </p>
            </div>
          )}

          {currentStep === 'availability' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Combien de minutes par jour pouvez-vous consacrer ?</Label>
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
                <Label>Heures visées par semaine</Label>
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
                Vos réponses servent à construire votre plan personnalisé.
              </p>
            </div>
          )}

          {currentStep === 'airport' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quel est votre aéroport principal ?</Label>
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
                Cet aéroport sert de point de départ dans votre carte de progression.
              </p>
            </div>
          )}

          {currentStep === 'challenges' && (
            <div className="space-y-4">
              <Label>Quels sont vos principaux défis ? (plusieurs choix possibles)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                Le plan mettra l’accent sur ces difficultés.
              </p>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Objectif professionnel</p>
                  <p className="font-semibold text-lg">{data.professionGoal}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Niveau d&apos;anglais</p>
                    <p className="font-semibold text-lg">{data.englishLevel}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Engagement quotidien</p>
                    <p className="font-semibold text-lg">{data.dailyMinutes} min</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Objectif hebdomadaire</p>
                    <p className="font-semibold text-lg">{data.weeklyGoal}h</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Aéroport principal</p>
                    <p className="font-semibold text-lg">{data.airportCode}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Défis</p>
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
                <Label htmlFor="motivation">Pourquoi souhaitez-vous apprendre l’anglais ?</Label>
                <textarea
                  id="motivation"
                  value={data.motivation}
                  onChange={(e) => setData({ ...data, motivation: e.target.value })}
                  placeholder="Décrivez votre motivation..."
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
              Retour
            </Button>
            {currentIndex === steps.length - 1 ? (
              <Button onClick={handleSubmit} className="flex-1">
                Générer mon plan
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                Suivant
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
