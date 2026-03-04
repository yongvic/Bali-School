'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Mail, AlertCircle, CheckCircle2, Clapperboard, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  return (
    <div className="page-shell">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="page-container-md py-6">
          <h1 className="page-title">Aide & support</h1>
          <p className="page-subtitle">Retrouvez les réponses aux questions fréquentes</p>
        </div>
      </div>

      <main className="page-container-md py-8 section-stack">
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Questions fréquentes</h2>

          {[
            {
              question: "Comment fonctionne le plan d'apprentissage sur 12 semaines ?",
              answer:
                'Votre plan est structuré en trois phases de 4 semaines: Fondation, Intermédiaire et Avancé, avec des exercices adaptés à votre niveau.',
            },
            {
              question: 'Comment gagner des points Kiki ?',
              answer:
                'Vous gagnez des points en complétant des exercices, en soumettant des vidéos, en maintenant votre régularité et en débloquant des badges.',
            },
            {
              question: 'Que faire si ma vidéo est refusée ?',
              answer:
                'Consultez le feedback de validation, corrigez les points demandés puis soumettez une nouvelle version.',
            },
            {
              question: 'Puis-je modifier mon niveau ?',
              answer:
                'Oui, vous pouvez refaire l’onboarding pour régénérer un plan correspondant à votre niveau actuel.',
            },
            {
              question: 'Combien de temps dure le programme ?',
              answer:
                'Le parcours standard dure 12 semaines, mais vous pouvez progresser à votre rythme.',
            },
            {
              question: 'Quels modes sont disponibles ?',
              answer:
                'Lecture, Quiz, Vocabulaire, Speaking, Simulation cabine, Passenger, Accent Training, Secret Challenge, Wheel of English, Love & English, Urgence, Interview Compagnie et Lost Passenger.',
            },
          ].map((faq, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="break-words">{faq.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground break-words">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Besoin d&apos;aide supplémentaire ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Si vous ne trouvez pas votre réponse, contactez notre équipe support.</p>
            <Button className="gap-2 w-full sm:w-auto">
              <Mail className="w-4 h-4" />
              Contacter le support
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Bonnes pratiques</h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Régularité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Faites au moins un exercice par jour pour garder une progression stable.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-primary" /> Feedback vidéo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Appliquez les retours de validation sur vos prochaines soumissions.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Suivre votre plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Respectez l’ordre des modules pour construire des bases solides.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Objectif badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Les badges matérialisent vos jalons pédagogiques.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Signaler un problème technique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">En cas de difficulté technique :</p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Videz le cache de votre navigateur puis rechargez la page</li>
              <li>Testez avec un autre navigateur</li>
              <li>Vérifiez votre connexion internet</li>
              <li>Contactez le support technique si le problème persiste</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
