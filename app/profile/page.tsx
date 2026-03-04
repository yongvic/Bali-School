'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileData {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: 'STUDENT' | 'ADMIN';
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Chargement impossible');
        const data = (await response.json()) as ProfileData;
        setProfile(data);
        setName(data.name || '');
      } catch (error) {
        toast.error('Impossible de charger le profil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Sauvegarde impossible');
      const data = (await response.json()) as ProfileData;
      setProfile(data);
      await update({ name: data.name, image: data.image });
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Echec de mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const onUploadAvatar = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Upload impossible');
      }
      const payload = (await response.json()) as { image: string };
      setProfile((prev) => (prev ? { ...prev, image: payload.image } : prev));
      await update({ image: payload.image });
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Echec upload');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Chargement du profil...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border">
                <AvatarImage src={profile.image || undefined} alt={profile.name || 'Avatar'} />
                <AvatarFallback>
                  {profile.name?.slice(0, 1).toUpperCase() || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="text-sm"
                  onChange={(event) => onUploadAvatar(event.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG ou WEBP (max 3MB). Une icone s&apos;affiche par defaut sans photo.
                </p>
                <p className="text-xs text-primary">{uploading ? 'Upload en cours...' : 'Choisissez un fichier pour mettre a jour la photo.'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nom affiché</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Rôle</p>
              <p className="text-sm text-muted-foreground">{profile.role === 'ADMIN' ? 'Administrateur' : 'Apprenant'}</p>
            </div>

            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
