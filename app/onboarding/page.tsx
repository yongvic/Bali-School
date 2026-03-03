'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createOnboarding } from './actions';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const steps = [
  { id: 'goal', title: 'Your Goal', description: 'What brings you here?' },
  { id: 'level', title: 'English Level', description: 'Assess your current level' },
  { id: 'availability', title: 'Your Time', description: 'How much time can you dedicate?' },
  { id: 'challenges', title: 'Challenges', description: 'What areas need improvement?' },
  { id: 'airport', title: 'Preferred Airport', description: 'Your home airport' },
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
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const [formData, setFormData] = useState({
    professionGoal: 'flight attendant',
    englishLevel: 'B1',
    dailyMinutes: 30,
    weeklyGoal: 5,
    challenges: [] as string[],
    motivation: '',
    airportCode: '',
    airportName: '',
  });

  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge],
    }));
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const result = await createOnboarding({
        userId: session.user.id,
        ...formData,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Onboarding complete! Generating your plan...');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Something went wrong');
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
        return formData.challenges.length > 0;
      case 4:
        return !!formData.airportCode;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 0: Goal */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>What's your primary goal?</Label>
                  <RadioGroup value={formData.professionGoal} onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, professionGoal: value }))
                  }>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flight attendant" id="fa" />
                      <Label htmlFor="fa" className="font-normal cursor-pointer">
                        Become a Flight Attendant
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="improve profession" id="ip" />
                      <Label htmlFor="ip" className="font-normal cursor-pointer">
                        Improve English for Aviation Career
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="personal growth" id="pg" />
                      <Label htmlFor="pg" className="font-normal cursor-pointer">
                        Personal Growth & Confidence
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 1: English Level */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>What's your current English level?</Label>
                  <RadioGroup value={formData.englishLevel} onValueChange={(value) =>
                    setFormData(prev => ({ ...prev, englishLevel: value }))
                  }>
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
                      <div key={level} className="flex items-center space-x-2">
                        <RadioGroupItem value={level} id={level} />
                        <Label htmlFor={level} className="font-normal cursor-pointer">
                          {level} - {
                            { 'A1': 'Elementary', 'A2': 'Pre-Intermediate', 'B1': 'Intermediate', 
                              'B2': 'Upper-Intermediate', 'C1': 'Advanced', 'C2': 'Mastery' }[level]
                          }
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2: Availability */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="daily">Minutes per day: {formData.dailyMinutes}</Label>
                  <input
                    id="daily"
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={formData.dailyMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, dailyMinutes: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly">Hours per week: {formData.weeklyGoal}</Label>
                  <input
                    id="weekly"
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={formData.weeklyGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, weeklyGoal: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Challenges */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <Label>Select areas where you need improvement:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {challengeOptions.map(challenge => (
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

            {/* Step 4: Airport */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="airportCode">Airport Code (e.g., CGK, SIN)</Label>
                  <Input
                    id="airportCode"
                    placeholder="CGK"
                    value={formData.airportCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, airportCode: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airportName">Airport Name</Label>
                  <Input
                    id="airportName"
                    placeholder="Soekarno-Hatta International Airport"
                    value={formData.airportName}
                    onChange={(e) => setFormData(prev => ({ ...prev, airportName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivation">What motivates you?</Label>
                  <textarea
                    id="motivation"
                    placeholder="Tell us what drives you to learn English..."
                    value={formData.motivation}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                    className="w-full p-2 border border-border rounded-md"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating Plan...' : 'Complete & Generate Plan'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
