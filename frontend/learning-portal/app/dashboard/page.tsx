"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, TrendingUp, Users } from "lucide-react";
import Navbar from "@/components/ui-custom/Navbar";
import MediaUpload from "@/components/ui-custom/MediaUpload";
import CourseEditor from "@/components/ui-custom/CourseEditor";
import { analyticsAPI, coursesAPI, Course, DashboardStats, Enrollment } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<Enrollment[]>([]);
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [instructorLoading, setInstructorLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));

    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    setUser(parsed);

    if (parsed?.id) {
      coursesAPI.getUserEnrollments(parsed.id)
        .then(res => setHistory(res.data))
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false));

      if (parsed.role === "instructor" || parsed.role === "admin") {
        coursesAPI.getInstructorCourses(parsed.id)
          .then(res => setInstructorCourses(res.data))
          .catch(() => setInstructorCourses([]))
          .finally(() => setInstructorLoading(false));
      } else {
        setInstructorLoading(false);
      }
    } else {
      setHistoryLoading(false);
      setInstructorLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Analytics Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" /> Platform Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-16 text-slate-400">Loading analytics...</div>
              ) : !stats ? (
                <div className="text-center py-16 text-red-400">Failed to load analytics.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Total Events", value: stats.total_events, icon: TrendingUp, color: "text-blue-600 bg-blue-100" },
                    { label: "Total Views", value: stats.total_views, icon: Eye, color: "text-green-600 bg-green-100" },
                    { label: "Top Courses", value: stats.top_courses.length, icon: BarChart3, color: "text-purple-600 bg-purple-100" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="rounded-3xl border border-slate-200 p-5 bg-white shadow-sm">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-sm text-slate-500 mt-4">{label}</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Your Learning History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-16 text-slate-400">Loading your enrollments...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-16 text-slate-400">No enrolled courses found yet.</div>
              ) : (
                <div className="space-y-4">
                  {history.map((enrollment) => (
                    <div key={enrollment.id} className="rounded-3xl border border-slate-200 p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">{enrollment.course?.title || `Course #${enrollment.course_id}`}</p>
                          <p className="text-lg font-semibold text-slate-900">{Math.round(enrollment.progress)}% complete</p>
                        </div>
                        <span className="text-xs text-slate-500">{enrollment.completed_at ? "Completed" : "In progress"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {user && (user.role === "instructor" || user.role === "admin") ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Instructor Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <CourseEditor
                  mode={editingCourse ? "edit" : "create"}
                  instructorId={user.id}
                  course={editingCourse ?? undefined}
                  onSuccess={(course) => {
                    setInstructorCourses((prev) => {
                      const exists = prev.some((item) => item.id === course.id);
                      if (exists) {
                        return prev.map((item) => (item.id === course.id ? course : item));
                      }
                      return [course, ...prev];
                    });
                    setEditingCourse(null);
                  }}
                  onCancel={() => setEditingCourse(null)}
                />

                {instructorLoading ? (
                  <div className="text-center py-16 text-slate-400">Loading instructor courses...</div>
                ) : instructorCourses.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">No courses found for your instructor account.</div>
                ) : (
                  <div className="space-y-6">
                    {instructorCourses.map((course) => (
                      <div key={course.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Course ID {course.id}</p>
                            <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{course.description || "No description available."}</p>
                            <p className="text-sm text-slate-500 mt-2">{course.lessons?.length || 0} leçon(s) enregistrée(s)</p>
                          </div>

                          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 w-full lg:w-80">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-slate-700">Course thumbnail</p>
                              {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt={course.title} className="h-32 w-full rounded-2xl object-cover" />
                              ) : (
                                <div className="h-32 w-full rounded-2xl bg-slate-100 flex items-center justify-center text-sm text-slate-500">No thumbnail yet</div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingCourse(course)}>
                                Modifier
                              </Button>
                              <Link href={`/courses/${course.id}`}>
                                <Button size="sm">Voir le cours</Button>
                              </Link>
                            </div>
                            <MediaUpload
                              course={course}
                              onThumbnailUpdated={async (url) => {
                                try {
                                  await coursesAPI.update(course.id, { thumbnail_url: url });
                                  setInstructorCourses((prev) => prev.map((item) => item.id === course.id ? { ...item, thumbnail_url: url } : item));
                                } catch {
                                  // ignore update failure, upload URL still available
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!loading && stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Course Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.top_courses.length === 0 ? (
                <p className="text-slate-400 text-sm">No course analytics available yet.</p>
              ) : (
                <div className="space-y-3">
                  {stats.top_courses.map((c, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Course #{c.course_id}</span>
                          <span className="text-sm text-slate-500">{c.views} views</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (c.views / (stats.top_courses[0]?.views || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}