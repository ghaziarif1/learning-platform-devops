"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Eye, TrendingUp, Users } from "lucide-react";
import Navbar from "@/components/ui-custom/Navbar";
import { analyticsAPI, DashboardStats } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Analytics Dashboard</h1>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading analytics...</div>
        ) : !stats ? (
          <div className="text-center py-20 text-red-400">Failed to load analytics.</div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Events", value: stats.total_events, icon: TrendingUp, color: "text-blue-600 bg-blue-100" },
                { label: "Total Views", value: stats.total_views, icon: Eye, color: "text-green-600 bg-green-100" },
                { label: "Top Courses", value: stats.top_courses.length, icon: BarChart3, color: "text-purple-600 bg-purple-100" },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="text-3xl font-bold text-slate-800">{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Top Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Top Courses by Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.top_courses.length === 0 ? (
                  <p className="text-slate-400 text-sm">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.top_courses.map((c, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
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

            {/* Enrollments by Day */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Enrollments (last 7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.enrollments_by_day.length === 0 ? (
                  <p className="text-slate-400 text-sm">No enrollments tracked yet.</p>
                ) : (
                  <div className="space-y-2">
                    {stats.enrollments_by_day.map((d, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-24">{d.day}</span>
                        <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                          <div className="h-6 bg-green-400 rounded flex items-center px-2"
                            style={{ width: `${Math.max(30, d.count * 30)}px` }}>
                            <span className="text-xs text-white font-medium">{d.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}