'use client';

import { useState } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const steps = [
  { id: 'goal', title: 'Pourquoi maintenant ?', description: 'Votre motivation pour devenir hôtesse' },
  { id: 'level', title: "Votre niveau d'anglais", description: 'Évaluez votre niveau actuel' },
  { id: 'availability', title: 'Votre disponibilité', description: 'Temps quotidien et hebdomadaire' },
  { id: 'timeline', title: 'Votre échéance', description: 'Quand voulez-vous être prête ?' },
  { id: 'camera', title: 'Face caméra ?', description: 'Êtes-vous à l’aise devant votre caméra ?' },
  { id: 'difficulty', title: 'Grande difficulté', description: "Dites-nous ce qui freine votre progression" },
  { id: 'challenges', title: 'Axes d’amélioration', description: 'Sélectionnez vos priorités' },
  { id: 'airport', title: 'Aéroport et motivation', description: 'Derniers détails pour personnaliser le plan' },
];

const challengeOptions = [
  'Pronunciation',
  'Listening comprehension',
  'Grammar and syntax',
  'Customer service phrases',
  'Emergency procedures',
  'Accent training',
  'Business English',
  'Confidence speaking',
];

export default function OnboardingPage() {
  const router = useRouter();
  const sessionState = useSession();
  const session = sessionState?.data;
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const [formData, setFormData] = useState({
    professionGoal: 'future flight attendant',
    englishLevel: 'B1',
    dailyMinutes: 30,
    weeklyGoal: 5,
    challenges: [] as string[],
    motivation: '',
    airportCode: '',
    airportName: '',
    readyInWeeks: 12,
    comfortableOnCamera: true,
    biggestDifficulty: '',
  });

  const handleChallengeToggle = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter((c) => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professionGoal: formData.professionGoal,
          englishLevel: formData.englishLevel,
          dailyMinutes: String(formData.dailyMinutes),
          weeklyGoal: String(formData.weeklyGoal),
          challenges: formData.challenges,
          motivation: formData.motivation,
          airportCode: formData.airportCode,
          airportName: formData.airportName,
          readyInWeeks: String(formData.readyInWeeks),
          comfortableOnCamera: formData.comfortableOnCamera,
          biggestDifficulty: formData.biggestDifficulty,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        toast.error(payload?.message || 'Échec de l’onboarding');
        return;
      }

      toast.success('Onboarding terminé. Génération du plan...');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Une erreur est survenue');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!formData.professionGoal;
      case 1:
        return !!formData.englishLevel;
      case 2:
        return formData.dailyMinutes > 0 && formData.weeklyGoal > 0;
      case 3:
        return formData.readyInWeeks >= 4;
      case 5:
        return formData.biggestDifficulty.trim().length >= 10;
      case 6:
        return formData.challenges.length > 0;
      case 7:
        return !!formData.airportCode && !!formData.airportName && formData.motivation.trim().length >= 10;
      default:
        return true;
    }
  };

  return (
    <div className="page-shell p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-colors ${i <= currentStep ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Étape {currentStep + 1} sur {steps.length}
          </div>
        </div>

        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
              <p className="font-semibold text-primary">Consignes de la phase</p>
              <p className="text-xs text-muted-foreground">
                Suivez les instructions ci-dessous : lisez attentivement la question, choisissez ou écrivez la réponse précise attendue et avancez étape par étape.
              </p>
            </div>
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Quel est votre objectif principal ?</Label>
                  <RadioGroup
                    value={formData.professionGoal}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, professionGoal: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="future flight attendant" id="fa" />
                      <Label htmlFor="fa" className="font-normal cursor-pointer">
                        Devenir hôtesse / steward
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="improve profession" id="ip" />
                      <Label htmlFor="ip" className="font-normal cursor-pointer">
                        Améliorer mon anglais pour ma carrière aérienne
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="personal growth" id="pg" />
                      <Label htmlFor="pg" className="font-normal cursor-pointer">
                        Développement personnel et confiance
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Quel est votre niveau actuel ?</Label>
                  <RadioGroup
                    value={formData.englishLevel}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, englishLevel: value }))}
                  >
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <RadioGroupItem value={level} id={level} />
                        <Label htmlFor={level} className="font-normal cursor-pointer">
                          {level} -{' '}
                          {
                            {
                              A1: 'Débutant',
                              A2: 'Pré-intermédiaire',
                              B1: 'Intermédiaire',
                              B2: 'Intermédiaire avancé',
                              C1: 'Avancé',
                              C2: 'Maîtrise',
                            }[level]
                          }
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="daily">Minutes par jour : {formData.dailyMinutes}</Label>
                  <input
                    id="daily"
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={formData.dailyMinutes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dailyMinutes: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly">Heures par semaine : {formData.weeklyGoal}</Label>
                  <input
                    id="weekly"
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={formData.weeklyGoal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weeklyGoal: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <Label>Dans combien de semaines voulez-vous être prête ?</Label>
                <input
                  type="range"
                  min="4"
                  max="52"
                  step="1"
                  value={formData.readyInWeeks}
                  onChange={(event) => setFormData((prev) => ({ ...prev, readyInWeeks: Number(event.target.value) }))}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Objectif : être prête dans {formData.readyInWeeks} semaines
                </p>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <Label>Avez-vous l’habitude de parler devant une caméra ?</Label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {['Oui', 'Non'].map((option) => (
                    <Button
                      key={option}
                      variant={formData.comfortableOnCamera === (option === 'Oui') ? 'default' : 'outline'}
                      onClick={() => setFormData((prev) => ({ ...prev, comfortableOnCamera: option === 'Oui' }))}
                      className="flex-1"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <Label>Quelle est votre plus grande difficulté en anglais ?</Label>
                  <textarea
                    id="difficulty"
                    placeholder="Exemple: parler naturellement avec les passagers ou gérer les procédures de sécurité..."
                    value={formData.biggestDifficulty}
                    onChange={(e) => setFormData((prev) => ({ ...prev, biggestDifficulty: e.target.value }))}
                    className="w-full p-2 border border-border rounded-md bg-background resize-y"
                    rows={3}
                  />
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <Label>Sélectionnez vos axes d'amélioration :</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {challengeOptions.map((challenge) => (
                    <div key={challenge} className="flex items-center space-x-2">
                      <Checkbox
                        id={challenge}
                        checked={formData.challenges.includes(challenge)}
                        onCheckedChange={() => handleChallengeToggle(challenge)}
                      />
                      <Label htmlFor={challenge} className="font-normal cursor-pointer">
                        {challenge}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="airportCode">Code aéroport (ex: CDG, ORY)</Label>
                  <Input
                    id="airportCode"
                    placeholder="CDG"
                    value={formData.airportCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, airportCode: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airportName">Nom de l'aéroport</Label>
                  <Input
                    id="airportName"
                    placeholder="Paris Charles de Gaulle"
                    value={formData.airportName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, airportName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivation">Qu'est-ce qui vous motive ?</Label>
                  <textarea
                    id="motivation"
                    placeholder="Expliquez ce qui vous motive à apprendre l'anglais..."
                    value={formData.motivation}
                    onChange={(e) => setFormData((prev) => ({ ...prev, motivation: e.target.value }))}
                    className="w-full p-2 border border-border rounded-md bg-background resize-y"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button onClick={() => setCurrentStep((prev) => prev + 1)} disabled={!canProceed()} className="w-full sm:flex-1">
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || isLoading} className="w-full sm:flex-1">
                  {isLoading ? 'Création du plan...' : 'Terminer et générer le plan'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
