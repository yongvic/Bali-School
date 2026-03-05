'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Module {
  week: number;
  title: string;
  description: string;
  targetPoints: number;
}

interface LearningPlan {
  id: string;
  weeklyFocus: string[];
  estimatedCompletion: string;
  modules: Module[];
  goals30: string[];
  goals60: string[];
  goals90: string[];
  weeklyObjectives: string[];
  skillFocuses: string[];
  exerciseSuggestions: string[];
}

export default function LearningPlanPrintPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const status = sessionState?.status ?? 'loading';
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loading, setLoading] = useState(true);

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch('/api/learning-plan');
        if (!response.ok) throw new Error('Plan introuvable');
        const data = await response.json();
        setPlan(data);
      } catch (error) {
        console.error('Print learning plan error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) fetchPlan();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!loading && plan) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [loading, plan]);

  if (status === 'loading' || loading) {
    return <div className="print-shell">Chargement du plan...</div>;
  }

  if (!plan) {
    return <div className="print-shell">Aucun plan disponible.</div>;
  }

  return (
    <div className="print-shell">
      <style jsx global>{`
        @page {
          size: A4;
          margin: 16mm;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #111827;
          background: #ffffff;
        }
        .print-shell {
          max-width: 100%;
          line-height: 1.45;
          font-size: 13px;
        }
        .head {
          text-align: center;
          margin-bottom: 18px;
        }
        .head h1 {
          margin: 0 0 6px;
          color: #0f4dbf;
          font-size: 24px;
        }
        .muted {
          color: #4b5563;
          font-size: 12px;
        }
        .section {
          margin-bottom: 16px;
          break-inside: avoid;
        }
        .section h2 {
          margin: 0 0 8px;
          color: #0f4dbf;
          font-size: 16px;
          border-left: 4px solid #0f4dbf;
          padding-left: 8px;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .card {
          border: 1px solid #dbe3f0;
          border-radius: 8px;
          padding: 10px;
          background: #f8fafc;
          break-inside: avoid;
        }
        .card h3 {
          margin: 0 0 6px;
          font-size: 14px;
        }
        ul {
          margin: 0;
          padding-left: 18px;
        }
        li {
          margin-bottom: 4px;
        }
        .module {
          border-left: 4px solid #0f4dbf;
          border: 1px solid #dbe3f0;
          border-left-width: 4px;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
          break-inside: avoid;
        }
        .module-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .module-meta {
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          .no-print {
            display: none;
          }
        }
      `}</style>

      <div className="head">
        <h1>Plan d&apos;apprentissage (12 semaines)</h1>
        <p className="muted">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="section">
        <h2>Objectifs 30 / 60 / 90 jours</h2>
        <div className="grid-3">
          <div className="card">
            <h3>30 jours</h3>
            <ul>{(plan.goals30 || []).map((g) => <li key={`g30-${g}`}>{g}</li>)}</ul>
          </div>
          <div className="card">
            <h3>60 jours</h3>
            <ul>{(plan.goals60 || []).map((g) => <li key={`g60-${g}`}>{g}</li>)}</ul>
          </div>
          <div className="card">
            <h3>90 jours</h3>
            <ul>{(plan.goals90 || []).map((g) => <li key={`g90-${g}`}>{g}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Compétences à maîtriser</h2>
        <ul>{(plan.skillFocuses || []).map((s) => <li key={s}>{s}</li>)}</ul>
      </div>

      <div className="section">
        <h2>Exercices suggérés</h2>
        <ul>{(plan.exerciseSuggestions || []).map((e) => <li key={e}>{e}</li>)}</ul>
      </div>

      <div className="section">
        <h2>Modules hebdomadaires</h2>
        {(plan.modules || []).map((module) => (
          <div key={module.week} className="module">
            <div className="module-title">Semaine {module.week}: {module.title}</div>
            <div>{module.description}</div>
            <div className="module-meta">Objectif: {module.targetPoints} points Kiki</div>
          </div>
        ))}
      </div>

      <p className="no-print muted">Astuce: dans la fenêtre d&apos;impression, choisissez “Enregistrer au format PDF”.</p>
    </div>
  );
}
