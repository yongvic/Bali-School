'use client';

import { useState, useRef, useCallback, useEffect, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, AlertTriangle, Upload, Loader, Video, Square, Eraser, BadgeCheck, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { validateVideo, ValidationResult } from '@/lib/video-validation';

interface VideoUploadSectionProps {
  exerciseId: string;
  onUploadSuccess?: (videoId: string) => void;
}

export function VideoUploadSection({ exerciseId, onUploadSuccess }: VideoUploadSectionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!recordedBlob) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(recordedBlob);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [recordedBlob]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.start();
      setIsRecording(true);
      setValidation(null);
      toast.success('Enregistrement démarré');
    } catch (error) {
      toast.error('Impossible d\'accéder à la caméra/micro');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Enregistrement arrêté');
    }
  };

  const validateFile = useCallback(async (blob: Blob) => {
    setIsValidating(true);
    setValidation(null);

    try {
      const file = new File([blob], `exercise-${exerciseId}.webm`, { type: 'video/webm' });
      const result = await validateVideo(file);
      setValidation(result);

      if (result.isValid) {
        toast.success('Validation vidéo réussie');
      } else {
        toast.error('La vidéo ne respecte pas les contraintes');
      }

      return result.isValid;
    } catch (error) {
      toast.error('Erreur de validation vidéo');
      console.error(error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [exerciseId]);

  const handleSubmit = async () => {
    if (!recordedBlob) {
      toast.error('Enregistrez une vidéo avant de soumettre');
      return;
    }

    const isValid = await validateFile(recordedBlob);
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('file', recordedBlob, `exercise-${exerciseId}.webm`);
      formData.append('exerciseId', exerciseId);

      const response = await fetch('/api/videos/upload', { method: 'POST', body: formData });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Échec d\'upload vidéo');
      }

      const data = await response.json();
      toast.success('Vidéo soumise pour revue');
      setRecordedBlob(null);
      chunksRef.current = [];
      setValidation(null);

      if (onUploadSuccess) {
        onUploadSuccess(data.videoId);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Échec de soumission vidéo');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setRecordedBlob(file);
    setValidation(null);
    toast.success('Vidéo sélectionnée depuis la galerie.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enregistrer votre réponse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div key={recordedBlob ? 'preview' : 'capture'} className="rounded-lg border-2 border-dashed border-border bg-muted/50 p-8">
            {recordedBlob ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 mb-4">
                    <BadgeCheck className="w-8 h-8" />
                  </div>
                  <p className="font-semibold mb-2">Enregistrement prêt</p>
                  <p className="text-sm text-muted-foreground">{(recordedBlob.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {previewUrl && <video controls className="w-full rounded-lg bg-black max-h-96" src={previewUrl} />}
              </div>
            ) : (
              <div className="text-center space-y-4">
                {isRecording ? <Square className="w-10 h-10 mx-auto text-red-500" /> : <Video className="w-10 h-10 mx-auto text-muted-foreground" />}
                <p className="text-muted-foreground">{isRecording ? 'Enregistrement en cours...' : 'Cliquez ci-dessous pour démarrer'}</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            capture="user"
            onChange={handleFilePick}
            className="hidden"
          />

          <div className="flex gap-3">
            {!recordedBlob && (
              <div key="record-controls" className="flex w-full gap-3">
                {!isRecording ? (
                  <Button onClick={startRecording} className="flex-1 gap-2" size="lg"><Video className="w-4 h-4" />Démarrer l&apos;enregistrement</Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" className="flex-1 gap-2" size="lg"><Square className="w-4 h-4" />Arrêter l&apos;enregistrement</Button>
                )}
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1 gap-2" size="lg">
                  <Upload className="w-4 h-4" />Choisir depuis la galerie
                </Button>
              </div>
            )}

            {recordedBlob && (
              <div key="review-controls" className="flex w-full gap-3">
                <Button variant="outline" onClick={() => { setRecordedBlob(null); chunksRef.current = []; setValidation(null); }} className="flex-1" size="lg">
                  <Eraser className="w-4 h-4 mr-2" />Effacer et recommencer
                </Button>
                {!validation && (
                  <Button onClick={() => validateFile(recordedBlob)} disabled={isValidating} variant="outline" className="flex-1" size="lg">
                    {isValidating ? 'Validation...' : 'Valider'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {validation && (
            <div className="space-y-3">
              {validation.isValid ? (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">Validation réussie</p>
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">La vidéo respecte les contraintes techniques.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400">Validation échouée</p>
                      <ul className="text-sm text-red-600 dark:text-red-500 mt-2 space-y-1">
                        {validation.errors.map((error) => <li key={error}>• {error}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-700 dark:text-amber-400">Avertissements</p>
                      <ul className="text-sm text-amber-600 dark:text-amber-500 mt-2 space-y-1">
                        {validation.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {recordedBlob && validation?.isValid && (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full gap-2" size="lg">
              {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" />Soumission...</> : <><Upload className="w-4 h-4" />Soumettre pour revue</>}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-base">Exigences vidéo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2"><Camera className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400" /><span>Soumission possible via caméra directe ou galerie de fichiers</span></div>
          <div className="flex items-start gap-2"><span className="text-blue-600 dark:text-blue-400 font-semibold">•</span><span>Durée: 10 secondes à 5 minutes</span></div>
          <div className="flex items-start gap-2"><span className="text-blue-600 dark:text-blue-400 font-semibold">•</span><span>Format: WebM, MP4, MOV ou AVI</span></div>
          <div className="flex items-start gap-2"><span className="text-blue-600 dark:text-blue-400 font-semibold">•</span><span>Taille maximale: 100 MB</span></div>
          <div className="flex items-start gap-2"><span className="text-blue-600 dark:text-blue-400 font-semibold">•</span><span>Audio et vidéo obligatoires</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
