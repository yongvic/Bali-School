'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Get answers to common questions</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          
          {[
            {
              question: 'How does the 12-week learning plan work?',
              answer: 'Your personalized plan is divided into three 4-week phases: Foundation, Intermediate, and Advanced. Each week includes targeted exercises and modules tailored to your English level.',
            },
            {
              question: 'How do I earn Kiki Points?',
              answer: 'You earn points by completing exercises, submitting videos, maintaining streaks, and unlocking badges. Each activity has different point values. The more you practice, the more points you earn!',
            },
            {
              question: 'What should I do if my video submission is rejected?',
              answer: 'Check the feedback provided by the instructor. Use their suggestions to improve your pronunciation and try again. Every submission is an opportunity to learn and improve.',
            },
            {
              question: 'Can I change my proficiency level?',
              answer: 'Yes! You can update your English level by completing the onboarding again. This will regenerate your learning plan based on your new level.',
            },
            {
              question: 'How long does it take to complete the program?',
              answer: 'The standard program is 12 weeks. However, you can progress at your own pace. Some learners may complete it faster, while others may take longer.',
            },
            {
              question: 'What exercise modes are available?',
              answer: 'You have access to 8 different exercise modes: Passenger Service, Accent Training, Emergency Scenarios, Role-Play, Listening, Wheel of English, Secret Challenge, and Custom Scenarios.',
            },
          ].map((faq, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Still Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you can't find the answer to your question, don't hesitate to reach out to our support team.
            </p>
            <Button className="gap-2">
              <Mail className="w-4 h-4" />
              Contact Support
            </Button>
          </CardContent>
        </Card>

        {/* Tips & Best Practices */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Tips for Success</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>✅</span> Consistency is Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Try to complete at least one exercise daily. Consistent practice leads to better results and helps you maintain learning streaks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>🎬</span> Make the Most of Video Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pay close attention to instructor feedback on your video submissions. Implement the suggestions in your next attempt to see rapid improvement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>🎯</span> Follow Your Learning Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your learning plan is designed based on your goals and proficiency level. Following it in order ensures you build a strong foundation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span>🏆</span> Aim for the Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Work towards achievement badges. They provide motivation and are milestones that mark your progress through the program.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technical Issues */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Reporting Technical Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If you experience any technical difficulties with the platform:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Clear your browser cache and reload the page</li>
              <li>Try using a different browser</li>
              <li>Check your internet connection</li>
              <li>Contact our technical support team if issues persist</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
