'use client';

import { useEffect, useState } from 'react';

interface Module {
    week: number;
    title: string;
    description: string;
    targetPoints: number;
}

interface LearningPlan {
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

interface OnboardingData {
    englishLevel?: string;
    airportName?: string;
    airportCode?: string;
    professionGoal?: string;
    dailyMinutes?: number;
    weeklyGoal?: number;
}

export default function PrintPlanPage() {
    const [plan, setPlan] = useState<LearningPlan | null>(null);
    const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
    const [userName, setUserName] = useState('Apprenant Ravi');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const fetch_data = async () => {
            try {
                const [planRes, profileRes, onboardingRes] = await Promise.all([
                    fetch('/api/learning-plan'),
                    fetch('/api/profile').catch(() => null),
                    fetch('/api/onboarding').catch(() => null),
                ]);

                if (planRes.ok) {
                    const planData = await planRes.json();
                    setPlan(planData);
                }

                if (profileRes && profileRes.ok) {
                    const profileData = await profileRes.json();
                    setUserName(profileData?.name || 'Apprenant Ravi');
                }

                if (onboardingRes && onboardingRes.ok) {
                    const onboardingData = await onboardingRes.json();
                    setOnboarding(onboardingData);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setReady(true);
            }
        };

        fetch_data();
    }, []);

    useEffect(() => {
        if (ready && plan) {
            // Small delay to ensure fonts/styles are loaded
            const timer = setTimeout(() => {
                window.print();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [ready, plan]);

    const today = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body, html {
          font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif;
          background: #fff;
          color: #1a1a1a;
          font-size: 14px;
          line-height: 1.5;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        /* ── HEADER ── */
        .header {
          text-align: center;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 2px solid #0066cc;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #0066cc;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .header .meta {
          font-size: 12px;
          color: #666;
        }
        .header .name-tag {
          display: inline-block;
          margin-top: 10px;
          background: #0066cc;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 4px 16px;
          border-radius: 20px;
        }

        /* ── PROFILE ── */
        .profile {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 28px;
          background: #f4f8ff;
          border: 1px solid #d0e3ff;
          border-radius: 12px;
          padding: 16px;
        }
        .profile-item strong {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #0066cc;
          margin-bottom: 3px;
        }
        .profile-item span {
          font-size: 13px;
          font-weight: 500;
          color: #1a1a1a;
        }

        /* ── SECTION TITLE ── */
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #0066cc;
          border-left: 4px solid #0066cc;
          padding-left: 10px;
          margin-bottom: 14px;
          margin-top: 24px;
        }

        /* ── GOAL GRID ── */
        .goal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .goal-card {
          background: #f8fafc;
          border: 1px solid #d0e3ff;
          border-radius: 10px;
          padding: 14px;
        }
        .goal-card h3 {
          font-size: 13px;
          font-weight: 700;
          color: #0066cc;
          margin-bottom: 8px;
        }
        .goal-card ul {
          padding-left: 16px;
          list-style: disc;
        }
        .goal-card li {
          font-size: 12px;
          color: #333;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        /* ── LIST BOX ── */
        .list-box {
          background: #f8fafc;
          border: 1px solid #e2eaf5;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 14px;
        }
        .list-box ul {
          padding-left: 18px;
          list-style: disc;
        }
        .list-box li {
          font-size: 12px;
          color: #333;
          margin-bottom: 4px;
        }

        /* ── WEEKLY OBJECTIVES ── */
        .weekly-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-bottom: 14px;
        }
        .weekly-item {
          background: #f8fafc;
          border: 1px solid #e2eaf5;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12px;
        }
        .weekly-item .week-label {
          font-weight: 700;
          color: #0066cc;
          margin-bottom: 2px;
          font-size: 11px;
        }

        /* ── MODULES ── */
        .modules-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .module-card {
          background: #fff;
          border: 1px solid #d0e3ff;
          border-left: 4px solid #0066cc;
          border-radius: 8px;
          padding: 12px 14px;
        }
        .module-card .week-num {
          font-size: 11px;
          font-weight: 700;
          color: #0066cc;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .module-card .module-title {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .module-card .module-desc {
          font-size: 11px;
          color: #555;
          line-height: 1.4;
          margin-bottom: 6px;
        }
        .module-card .points {
          font-size: 11px;
          font-weight: 600;
          color: #0066cc;
          background: #e8f0fe;
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
        }

        /* ── PHASE HEADER ── */
        .phase-header {
          background: #e8f0fe;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 700;
          color: #0047ab;
          margin-top: 20px;
          margin-bottom: 10px;
        }

        /* ── FOOTER ── */
        .footer {
          margin-top: 28px;
          padding-top: 14px;
          border-top: 1px dashed #ccc;
          font-size: 11px;
          color: #777;
          text-align: center;
        }

        /* ── LOADING ── */
        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-size: 16px;
          color: #666;
        }

        /* ── PRINT OVERRIDES ── */
        @page {
          size: A4;
          margin: 14mm 12mm;
        }

        @media print {
          nav, header { display: none !important; }
          body { font-size: 11px; }
          .header h1 { font-size: 22px; }
          .section-title { font-size: 14px; }
          .goal-grid { grid-template-columns: repeat(3, 1fr); }
          .modules-grid { grid-template-columns: repeat(2, 1fr); }
          .weekly-grid { grid-template-columns: repeat(2, 1fr); }
          .module-card,
          .goal-card,
          .weekly-item,
          .list-box {
            break-inside: avoid;
          }
          .phase-header { break-before: auto; }
        }
      `}</style>

            {!ready || !plan ? (
                <div className="loading">
                    <span>Préparation du plan en cours…</span>
                </div>
            ) : (
                <div className="container">
                    {/* HEADER */}
                    <div className="header">
                        <h1>Plan d&apos;apprentissage · 12 semaines</h1>
                        <div className="meta">Ravi&apos;s Aviation English &nbsp;·&nbsp; Généré le {today}</div>
                        <div className="name-tag">{userName}</div>
                    </div>

                    {/* PROFILE */}
                    <div className="profile">
                        <div className="profile-item">
                            <strong>Niveau</strong>
                            <span>{onboarding?.englishLevel || '—'}</span>
                        </div>
                        <div className="profile-item">
                            <strong>Aéroport</strong>
                            <span>{onboarding?.airportName || onboarding?.airportCode || '—'}</span>
                        </div>
                        <div className="profile-item">
                            <strong>Objectif pro</strong>
                            <span>{onboarding?.professionGoal || '—'}</span>
                        </div>
                        <div className="profile-item">
                            <strong>Routine quotidienne</strong>
                            <span>{onboarding?.dailyMinutes || 30} min / jour</span>
                        </div>
                        <div className="profile-item">
                            <strong>Objectif hebdo</strong>
                            <span>{onboarding?.weeklyGoal || 5} h</span>
                        </div>
                        <div className="profile-item">
                            <strong>Fin estimée</strong>
                            <span>{new Date(plan.estimatedCompletion).toLocaleDateString('fr-FR')}</span>
                        </div>
                    </div>

                    {/* GOALS 30/60/90 */}
                    <div className="section-title">Objectifs 30 / 60 / 90 jours</div>
                    <div className="goal-grid">
                        {[
                            { label: '30 jours', goals: plan.goals30 || [] },
                            { label: '60 jours', goals: plan.goals60 || [] },
                            { label: '90 jours', goals: plan.goals90 || [] },
                        ].map(({ label, goals }) =>
                            goals.length > 0 ? (
                                <div key={label} className="goal-card">
                                    <h3>{label}</h3>
                                    <ul>
                                        {goals.map((g, i) => (
                                            <li key={i}>{g}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null
                        )}
                    </div>

                    {/* SKILLS */}
                    {(plan.skillFocuses || []).length > 0 && (
                        <>
                            <div className="section-title">Compétences à maîtriser</div>
                            <div className="list-box">
                                <ul>
                                    {plan.skillFocuses.map((s, i) => (
                                        <li key={i}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    {/* EXERCISES */}
                    {(plan.exerciseSuggestions || []).length > 0 && (
                        <>
                            <div className="section-title">Exercices suggérés</div>
                            <div className="list-box">
                                <ul>
                                    {plan.exerciseSuggestions.map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}

                    {/* WEEKLY OBJECTIVES */}
                    {(plan.weeklyObjectives || []).length > 0 && (
                        <>
                            <div className="section-title">Objectifs hebdomadaires</div>
                            <div className="weekly-grid">
                                {plan.weeklyObjectives.map((obj, i) => (
                                    <div key={i} className="weekly-item">
                                        <div className="week-label">Semaine {i + 1}</div>
                                        <div>{obj}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* MODULES BY PHASE */}
                    <div className="section-title">Feuille de route — 12 semaines</div>

                    {[
                        { phase: 'Phase Fondation', weeks: [1, 2, 3, 4] },
                        { phase: 'Phase Intermédiaire', weeks: [5, 6, 7, 8] },
                        { phase: 'Phase Avancée', weeks: [9, 10, 11, 12] },
                    ].map(({ phase, weeks }) => {
                        const phaseModules = plan.modules.filter((m) => weeks.includes(m.week));
                        if (phaseModules.length === 0) return null;
                        return (
                            <div key={phase}>
                                <div className="phase-header">{phase} · Semaines {weeks[0]}–{weeks[weeks.length - 1]}</div>
                                <div className="modules-grid">
                                    {phaseModules.map((mod) => (
                                        <div key={mod.week} className="module-card">
                                            <div className="week-num">Semaine {mod.week}</div>
                                            <div className="module-title">{mod.title}</div>
                                            <div className="module-desc">{mod.description}</div>
                                            <span className="points">{mod.targetPoints} pts Kiki</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* FOOTER */}
                    <div className="footer">
                        Ce plan est personnalisé selon votre profil. Consultez-le chaque semaine et cumulez des points Kiki pour suivre votre progression.
                        &nbsp;·&nbsp; Ravi&apos;s Aviation English &nbsp;·&nbsp; {today}
                    </div>
                </div>
            )}
        </>
    );
}
