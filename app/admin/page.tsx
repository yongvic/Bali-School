'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Users, Video, MessageSquare, CheckCircle2 } from 'lucide-react';

interface VideoSubmission {
  id: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  videoUrl: string;
  exerciseTitle: string;
}

interface AdminStats {
  totalStudents: number;
  pendingVideos: number;
  totalVideosReviewed: number;
  averageCompletionRate: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoSubmission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (session?.user?.role !== 'ADMIN') {
        redirect('/dashboard');
        return;
      }

      try {
        const [statsRes, videosRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/videos'),
        ]);

        if (!statsRes.ok || !videosRes.ok) {
          throw new Error('Failed to fetch admin data');
        }

        const statsData = await statsRes.json();
        const videosData = await videosRes.json();

        setStats(statsData);
        setVideos(videosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      checkAdminAndFetch();
    }
  }, [session?.user?.id, session?.user?.role]);

  const handleVideoAction = async (videoId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          feedback: feedbackText,
        }),
      });

      if (!response.ok) throw new Error('Failed to update video');

      // Refresh videos
      const videosRes = await fetch('/api/admin/videos');
      const videosData = await videosRes.json();
      setVideos(videosData);
      setSelectedVideo(null);
      setFeedbackText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage student submissions and track progress</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Video className="w-4 h-4 text-orange-500" />
                  Pending Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-500">{stats.pendingVideos}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Videos Reviewed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">{stats.totalVideosReviewed}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span>📊</span> Avg Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{Math.round(stats.averageCompletionRate)}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Video Review Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Videos List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Pending Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {videos.filter(v => v.status === 'pending').length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No pending videos
                    </p>
                  ) : (
                    videos
                      .filter(v => v.status === 'pending')
                      .map(video => (
                        <button
                          key={video.id}
                          onClick={() => setSelectedVideo(video)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedVideo?.id === video.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <p className="text-sm font-semibold line-clamp-1">{video.exerciseTitle}</p>
                          <p className="text-xs opacity-75">{video.userName}</p>
                          <p className="text-xs opacity-75">
                            {new Date(video.submittedAt).toLocaleDateString()}
                          </p>
                        </button>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Review Panel */}
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedVideo.exerciseTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted by: {selectedVideo.userName}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video Player */}
                  <div className="w-full bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Video Player</p>
                      <p className="text-xs text-muted-foreground mt-1">{selectedVideo.videoUrl}</p>
                    </div>
                  </div>

                  {/* Feedback Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Your Feedback</label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Provide constructive feedback for the student..."
                        className="w-full p-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition"
                        rows={4}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleVideoAction(selectedVideo.id, 'reject')}
                        disabled={isSubmittingFeedback}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleVideoAction(selectedVideo.id, 'approve')}
                        disabled={isSubmittingFeedback}
                        className="flex-1"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          'Approve'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Select a video to review</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* All Videos Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-4">Exercise</th>
                    <th className="text-left py-3 px-4">Submitted</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map(video => (
                    <tr key={video.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{video.userName}</td>
                      <td className="py-3 px-4">{video.exerciseTitle}</td>
                      <td className="py-3 px-4">
                        {new Date(video.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          video.status === 'pending'
                            ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
                            : video.status === 'approved'
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                            : 'bg-red-500/10 text-red-700 dark:text-red-400'
                        }`}>
                          {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
