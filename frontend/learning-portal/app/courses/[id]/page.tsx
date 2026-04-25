"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle, DollarSign } from "lucide-react";
import Navbar from "@/components/ui-custom/Navbar";
import AiChat from "@/components/ui-custom/AiChat";
import FeedbackForm from "@/components/ui-custom/FeedbackForm";
import { coursesAPI, analyticsAPI, Course } from "@/lib/api";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse]     = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await coursesAPI.getById(Number(id));
        setCourse(res.data);
        analyticsAPI.trackView(Number(id));
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const enroll = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) { window.location.href = "/login"; return; }
      await coursesAPI.enroll(user.id, Number(id));
      setEnrolled(true);
      analyticsAPI.trackEvent({ event_type: "enrollment", user_id: user.id, course_id: Number(id) });
    } catch { setEnrolled(true); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="text-center py-20 text-slate-400">Loading...</div></div>;
  if (!course) return <div className="min-h-screen bg-slate-50"><Navbar /><div className="text-center py-20 text-slate-400">Course not found.</div></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-blue-600">{course.category}</Badge>
            <Badge variant="outline" className="text-white border-white">{course.level}</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
          <p className="text-slate-300 max-w-2xl mb-6">{course.description}</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-green-400">
              {course.is_free ? "Gratuit" : `${course.price} DT`}
            </span>
            {enrolled ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" /> Enrolled!
              </div>
            ) : (
              <Button onClick={enroll} className="bg-green-500 hover:bg-green-600">
                {course.is_free ? "S'inscrire Gratuitement" : `S'inscrire — ${course.price} DT`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="lessons">
              <TabsList className="mb-6">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" /> Course Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course.lessons && course.lessons.length > 0 ? (
                      <div className="space-y-2">
                        {course.lessons
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((lesson, i) => (
                            <div key={lesson.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                              <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {i + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-slate-800">{lesson.title}</p>
                                {lesson.duration_minutes > 0 && (
                                  <p className="text-xs text-slate-500">{lesson.duration_minutes} min</p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">No lessons added yet.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback">
                <FeedbackForm courseId={course.id} courseTitle={course.title} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar — AI Chat */}
          <div>
            <AiChat
              courseId={course.id}
              courseTitle={course.title}
              courseDescription={course.description}
            />
          </div>
        </div>
      </div>
    </div>
  );
}