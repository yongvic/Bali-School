'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, MapPin, Lock, CheckCircle2 } from 'lucide-react';

interface AirportMapData {
  progressPercentage: number;
  currentTerminal: number;
  completedAreas: string[];
}

export default function AirportMapPage() {
  const sessionState = useSession();
  const session = sessionState?.data;
  const [mapData, setMapData] = useState<AirportMapData | null>(null);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const fetchMap = async () => {
      const response = await fetch('/api/airport-map');
      if (!response.ok) return;
      const data = await response.json();
      setMapData(data);
    };

    fetchMap();
  }, []);

  const progress = mapData?.progressPercentage ?? 0;
  const terminal = mapData?.currentTerminal ?? 1;
  const zones = [
    { id: 1, name: 'Check-in A1', left: '8%', top: '62%' },
    { id: 2, name: 'Security A2', left: '24%', top: '38%' },
    { id: 3, name: 'Boarding B1', left: '42%', top: '55%' },
    { id: 4, name: 'Terminal B2', left: '62%', top: '32%' },
    { id: 5, name: 'Lounge C1', left: '82%', top: '48%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Plane className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Carte aéroport</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">Progression globale: {progress}%</p>
            <p className="text-sm text-muted-foreground">Terminal actuel: T{terminal}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carte de progression interactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[320px] rounded-xl border bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 overflow-hidden">
              <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <svg className="absolute inset-0 w-full h-full">
                <path d="M 40 230 C 140 80, 260 240, 360 110 S 560 210, 680 140" stroke="#38bdf8" strokeWidth="8" fill="none" strokeDasharray="12 10" />
              </svg>

              {zones.map((zone) => {
                const unlocked = terminal >= zone.id;
                const active = terminal === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-lg border text-xs shadow-sm ${
                      unlocked ? 'bg-white/90 border-emerald-300' : 'bg-white/70 border-slate-300'
                    }`}
                    style={{ left: zone.left, top: zone.top }}
                    title={zone.name}
                  >
                    <div className="flex items-center gap-2">
                      {unlocked ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      <span className={active ? 'font-semibold text-primary' : 'text-slate-700'}>{zone.name}</span>
                    </div>
                    {active && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] px-2 py-1 rounded-md">
                        Niveau actuel
                      </div>
                    )}
                  </button>
                );
              })}

              <div
                className="absolute transition-all duration-700 ease-in-out"
                style={{ left: zones[Math.max(terminal - 1, 0)].left, top: zones[Math.max(terminal - 1, 0)].top, transform: 'translate(-50%, -150%)' }}
                title="Position de l’apprenant"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
