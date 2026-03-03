'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { BarChart3, Users, Video, MessageSquare } from 'lucide-react';

interface AdminStats {
  totalStudents: number;
  pendingVideos: number;
  approvedVideos: number;
  totalPoints: number;
  totalExercises: number;
}

interface PendingVideo {
  id: string;
  studentName: string;
  exerciseTitle: string;
  submittedAt: string;
  duration?: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  exercisesCompleted: number;
  videosSubmitted: number;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, videosRes, studentsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/videos/pending'),
          fetch('/api/admin/students'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setPendingVideos(videosData);
        }

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }
      } catch (error) {
        toast.error('Failed to load admin data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Loading Admin Dashboard...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Manage students, review videos, and monitor platform activity
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" /> Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="w-4 h-4" /> Pending Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.pendingVideos}
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.approvedVideos}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Exercises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalExercises}
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>🎯</span> Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {(stats.totalPoints / 1000).toFixed(1)}k
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="gap-2">
              <span>🎬</span> Pending Videos ({pendingVideos.length})
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <span>👥</span> Students ({students.length})
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <span>📚</span> Content Management
            </TabsTrigger>
          </TabsList>

          {/* Pending Videos Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingVideos.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Pending Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All student video submissions have been reviewed!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingVideos.map(video => (
                  <Card key={video.id} className="border-orange-500/20 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{video.exerciseTitle}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            By {video.studentName}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Submitted: {new Date(video.submittedAt).toLocaleDateString()}</span>
                        {video.duration && <span>Duration: {video.duration}s</span>}
                      </div>
                      <Link href={`/admin/review/${video.id}`}>
                        <Button className="w-full gap-2">
                          <span>Review & Provide Feedback</span> →
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Exercises</th>
                    <th className="text-left py-3 px-4 font-semibold">Videos</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{student.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{student.email}</td>
                      <td className="py-3 px-4 text-sm">{student.exercisesCompleted}</td>
                      <td className="py-3 px-4 text-sm">{student.videosSubmitted}</td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/students/${student.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Manage exercises, modules, and learning content
                </p>
                <Button variant="outline" className="w-full">
                  Add New Exercise
                </Button>
                <Button variant="outline" className="w-full">
                  Manage Modules
                </Button>
                <Button variant="outline" className="w-full">
                  View Content Library
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badge & Gamification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Configure points, badges, and reward system
                </p>
                <Button variant="outline" className="w-full">
                  Edit Point Values
                </Button>
                <Button variant="outline" className="w-full">
                  Configure Badges
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
