"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, CheckCircle, DollarSign, Play, Sparkles, FileText } from "lucide-react";
import Navbar from "@/components/ui-custom/Navbar";
import AiChat from "@/components/ui-custom/AiChat";
import FeedbackForm from "@/components/ui-custom/FeedbackForm";
import { coursesAPI, analyticsAPI, aiAPI, Course, Enrollment, Lesson, QuizResponse } from "@/lib/api";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationReason, setRecommendationReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizLoading, setQuizLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [courseLevel, setCourseLevel] = useState("beginner");
  const [coursePrice, setCoursePrice] = useState("0");
  const [courseIsFree, setCourseIsFree] = useState(true);
  const [courseUpdateStatus, setCourseUpdateStatus] = useState("");
  const [courseSaving, setCourseSaving] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonUrl, setLessonUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("15");
  const [lessonOrderIndex, setLessonOrderIndex] = useState("1");
  const [lessonStatus, setLessonStatus] = useState("");
  const [lessonSaving, setLessonSaving] = useState(false);
  const [lessonEditTitle, setLessonEditTitle] = useState("");
  const [lessonEditContent, setLessonEditContent] = useState("");
  const [lessonEditUrl, setLessonEditUrl] = useState("");
  const [lessonEditDuration, setLessonEditDuration] = useState("15");
  const [lessonEditOrderIndex, setLessonEditOrderIndex] = useState("1");
  const [lessonEditStatus, setLessonEditStatus] = useState("");
  const [lessonEditSaving, setLessonEditSaving] = useState(false);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"lessons" | "quiz" | "recommendations" | "feedback">("lessons");
  const [quizLessonId, setQuizLessonId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await coursesAPI.getById(Number(id));
        setCourse(res.data);
        analyticsAPI.trackView(Number(id));
      } catch {};
    };
    load().finally(() => setLoading(false));
  }, [id]);

  const userId = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id || null;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!course) return;
    setCourseTitle(course.title);
    setCourseDescription(course.description || "");
    setCourseCategory(course.category || "");
    setCourseLevel(course.level);
    setCoursePrice(course.price?.toString() || "0");
    setCourseIsFree(course.is_free ?? true);
    setSelectedLesson(prev => prev || course.lessons?.slice().sort((a, b) => a.order_index - b.order_index)[0] || null);
    if (!quizLessonId && course.lessons && course.lessons.length > 0) {
      setQuizLessonId(course.lessons[0].id);
    }
    if (!userId) return;

    coursesAPI.getUserEnrollments(userId)
      .then(res => {
        const match = res.data.find(item => item.course_id === course.id);
        if (match) setEnrollment(match);
      })
      .catch(() => null);
  }, [course, userId, quizLessonId]);

  useEffect(() => {
    if (!selectedLesson) {
      setLessonEditTitle("");
      setLessonEditContent("");
      setLessonEditUrl("");
      setLessonEditDuration("15");
      setLessonEditOrderIndex("1");
      return;
    }

    setLessonEditTitle(selectedLesson.title || "");
    setLessonEditContent(selectedLesson.content || "");
    setLessonEditUrl(selectedLesson.video_url || "");
    setLessonEditDuration((selectedLesson.duration_minutes || 0).toString());
    setLessonEditOrderIndex((selectedLesson.order_index || 1).toString());
  }, [selectedLesson]);

  const enroll = async () => {
    if (!userId) { window.location.href = "/login"; return; }
    try {
      await coursesAPI.enroll(userId, Number(id));
      const res = await coursesAPI.getUserEnrollments(userId);
      const match = res.data.find(item => item.course_id === Number(id));
      if (match) setEnrollment(match);
      analyticsAPI.trackEvent({ event_type: "enrollment", user_id: userId, course_id: Number(id) });
    } catch {
      return;
    }
  };

  const progressPercent = enrollment ? Number(enrollment.progress) : 0;

  const markLessonComplete = async (lesson: Lesson) => {
    if (!course || !enrollment) return;
    const orderedLessons = [...(course.lessons || [])].sort((a, b) => a.order_index - b.order_index);
    const lessonIndex = orderedLessons.findIndex(item => item.id === lesson.id);
    const percent = Math.min(100, Math.round(((lessonIndex + 1) / Math.max(1, orderedLessons.length)) * 100));

    try {
      await coursesAPI.updateEnrollmentProgress(enrollment.id, percent);
      setEnrollment({ ...enrollment, progress: percent, completed_at: percent >= 100 ? new Date().toISOString() : enrollment.completed_at });
    } catch {
      return;
    }
  };

  const generateQuiz = async () => {
    if (!course) return;
    const lessonForQuiz = course.lessons?.find((lesson) => lesson.id === quizLessonId) || selectedLesson;
    if (!lessonForQuiz) return;
    setQuizLoading(true);
    try {
      const res = await aiAPI.generateQuiz({
        course_id: course.id,
        course_title: course.title,
        lesson_content: lessonForQuiz.content || "",
        num_questions: 3,
        difficulty: "medium",
      });
      setQuiz(res.data);
    } catch {
      setQuiz(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const isInstructorOwner = Boolean(user && course && (user.role === "admin" || (user.role === "instructor" && course.instructor_id === user.id)));

  const updateCourse = async () => {
    if (!course) return;
    setCourseSaving(true);
    setCourseUpdateStatus("");
    try {
      const res = await coursesAPI.update(course.id, {
        title: courseTitle.trim(),
        description: courseDescription.trim(),
        category: courseCategory.trim() || undefined,
        level: courseLevel,
        is_free: courseIsFree,
        price: courseIsFree ? 0 : Number(coursePrice) || 0,
      });
      setCourse(res.data);
      setCourseUpdateStatus("Cours mis à jour avec succès.");
    } catch {
      setCourseUpdateStatus("Impossible de mettre à jour le cours.");
    } finally {
      setCourseSaving(false);
    }
  };

  const deleteCourse = async () => {
    if (!course) return;
    if (!confirm("Voulez-vous vraiment supprimer ce cours ? Cette action est irréversible.")) return;
    try {
      await coursesAPI.delete(course.id);
      window.location.href = "/courses";
    } catch {
      setCourseUpdateStatus("Impossible de supprimer le cours.");
    }
  };

  const createLesson = async () => {
    if (!course) return;
    if (!lessonTitle.trim()) {
      setLessonStatus("Le titre de la leçon est requis.");
      return;
    }

    setLessonSaving(true);
    setLessonStatus("");
    try {
      const res = await coursesAPI.addLesson(course.id, {
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        video_url: lessonUrl.trim() || undefined,
        duration_minutes: Number(lessonDuration) || 0,
        order_index: Number(lessonOrderIndex) || ((course.lessons?.length || 0) + 1),
      });

      const updatedLessons = [...(course.lessons || []), res.data].sort((a, b) => a.order_index - b.order_index);
      setCourse({ ...course, lessons: updatedLessons });
      setSelectedLesson(res.data);
      setLessonTitle("");
      setLessonContent("");
      setLessonUrl("");
      setLessonDuration("15");
      setLessonOrderIndex((updatedLessons.length + 1).toString());
      setLessonStatus("Leçon ajoutée avec succès.");
    } catch {
      setLessonStatus("Échec de la création de la leçon.");
    } finally {
      setLessonSaving(false);
    }
  };

  const updateLesson = async () => {
    if (!course || !selectedLesson) return;
    if (!lessonEditTitle.trim()) {
      setLessonEditStatus("Le titre de la leçon est requis.");
      return;
    }

    setLessonEditSaving(true);
    setLessonEditStatus("");
    try {
      const res = await coursesAPI.updateLesson(course.id, selectedLesson.id, {
        title: lessonEditTitle.trim(),
        content: lessonEditContent.trim(),
        video_url: lessonEditUrl.trim() || undefined,
        duration_minutes: Number(lessonEditDuration) || 0,
        order_index: Number(lessonEditOrderIndex) || selectedLesson.order_index,
      });

      const updatedLessons = (course.lessons || []).map((lesson) =>
        lesson.id === res.data.id ? res.data : lesson
      ).sort((a, b) => a.order_index - b.order_index);

      setCourse({ ...course, lessons: updatedLessons });
      setSelectedLesson(res.data);
      setLessonEditStatus("Leçon mise à jour avec succès.");
    } catch {
      setLessonEditStatus("Impossible de mettre à jour la leçon.");
    } finally {
      setLessonEditSaving(false);
    }
  };

  const deleteLesson = async () => {
    if (!course || !selectedLesson) return;
    if (!confirm("Voulez-vous vraiment supprimer cette leçon ?")) return;

    setLessonEditSaving(true);
    setLessonEditStatus("");
    try {
      await coursesAPI.deleteLesson(course.id, selectedLesson.id);
      const remainingLessons = (course.lessons || []).filter((lesson) => lesson.id !== selectedLesson.id);
      setCourse({ ...course, lessons: remainingLessons });
      setSelectedLesson(remainingLessons[0] || null);
      setLessonEditStatus("Leçon supprimée avec succès.");
    } catch {
      setLessonEditStatus("Impossible de supprimer la leçon.");
    } finally {
      setLessonEditSaving(false);
    }
  };

  const loadRecommendations = async () => {
    if (!userId || !course) return;
    setRecommendationLoading(true);
    try {
      const res = await aiAPI.getRecommendations({
        user_id: userId,
        interests: course.category ? [course.category] : [],
        current_level: course.level,
      });
      setRecommendations(res.data.recommendations || []);
      setRecommendationReason(res.data.reasoning || "");
    } catch {
      setRecommendations([]);
      setRecommendationReason("");
    } finally {
      setRecommendationLoading(false);
    }
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
            {enrollment ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" /> Inscrit
              </div>
            ) : (
              <Button onClick={enroll} className="bg-green-500 hover:bg-green-600">
                {course.is_free ? "S'inscrire Gratuitement" : `S'inscrire — ${course.price} DT`}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isInstructorOwner ? (
              <p className="text-sm text-slate-700">Vous pouvez ajouter des leçons ou créer un quiz pour chaque leçon de ce cours.</p>
            ) : (
              <p className="text-sm text-slate-700">Vous pouvez donner un feedback ou consulter le contenu du cours.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {isInstructorOwner ? (
              <>
                <Button onClick={() => { setShowAddLessonForm(prev => !prev); setActiveTab("lessons"); }} className="bg-emerald-600 hover:bg-emerald-700">
                  {showAddLessonForm ? "Masquer le formulaire" : "Ajouter une leçon"}
                </Button>
                <Button onClick={() => setActiveTab("quiz")} className="bg-purple-600 hover:bg-purple-700">
                  Créer un quiz
                </Button>
              </>
            ) : (
              <Button onClick={() => setActiveTab("feedback")} className="bg-sky-600 hover:bg-sky-700">
                Donner un feedback
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">Progression enregistrée</p>
                    <span className="text-sm font-semibold text-slate-900">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-blue-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {isInstructorOwner ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Outils instructeur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-title">Titre du cours</Label>
                        <Input
                          id="edit-title"
                          value={courseTitle}
                          onChange={(e) => setCourseTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          className="min-h-[120px]"
                          value={courseDescription}
                          onChange={(e) => setCourseDescription(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-category">Catégorie</Label>
                          <Input
                            id="edit-category"
                            value={courseCategory}
                            onChange={(e) => setCourseCategory(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-level">Niveau</Label>
                          <select
                            id="edit-level"
                            className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                            value={courseLevel}
                            onChange={(e) => setCourseLevel(e.target.value)}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <input
                            id="edit-is-free"
                            type="checkbox"
                            checked={courseIsFree}
                            onChange={(e) => setCourseIsFree(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          />
                          <label htmlFor="edit-is-free" className="text-sm text-slate-700">Cours gratuit</label>
                        </div>
                        <div>
                          <Label htmlFor="edit-price">Prix</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={coursePrice}
                            onChange={(e) => setCoursePrice(e.target.value)}
                            disabled={courseIsFree}
                          />
                        </div>
                      </div>
                      {courseUpdateStatus ? <p className="text-sm text-slate-600">{courseUpdateStatus}</p> : null}
                      <div className="flex flex-col gap-3">
                        <Button onClick={updateCourse} disabled={courseSaving} className="bg-blue-600 hover:bg-blue-700">
                          {courseSaving ? "Enregistrement..." : "Mettre à jour le cours"}
                        </Button>
                        <Button onClick={deleteCourse} variant="destructive" disabled={courseSaving}>
                          Supprimer le cours
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900 mb-2">Gestion des leçons</p>
                        <p className="text-sm text-slate-500">Utilisez le panneau Leçons pour ajouter, modifier ou supprimer des leçons depuis ce cours.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "lessons" | "quiz" | "recommendations" | "feedback")}>
              <TabsList className="mb-6">
                <TabsTrigger value="lessons">Leçons</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
                <TabsTrigger value="feedback">Avis</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Leçons</h2>
                    <p className="text-sm text-slate-500">Ajoutez ou gérez vos leçons depuis ce panneau.</p>
                  </div>
                  {isInstructorOwner ? (
                    <Button onClick={() => setShowAddLessonForm((prev) => !prev)} className="bg-emerald-600 hover:bg-emerald-700">
                      {showAddLessonForm ? "Masquer le formulaire" : "Ajouter une leçon"}
                    </Button>
                  ) : null}
                </div>
                {showAddLessonForm ? (
                  <Card className="mb-6 border-emerald-200 bg-emerald-50/70">
                    <CardHeader>
                      <CardTitle className="text-lg">Nouvelle leçon</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                          <Label htmlFor="lesson-title">Titre</Label>
                          <Input
                            id="lesson-title"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="lesson-order">Ordre</Label>
                            <Input
                              id="lesson-order"
                              type="number"
                              min="1"
                              value={lessonOrderIndex}
                              onChange={(e) => setLessonOrderIndex(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lesson-duration">Durée</Label>
                            <Input
                              id="lesson-duration"
                              type="number"
                              min="1"
                              value={lessonDuration}
                              onChange={(e) => setLessonDuration(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="lesson-video">URL vidéo</Label>
                          <Input
                            id="lesson-video"
                            value={lessonUrl}
                            onChange={(e) => setLessonUrl(e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="lesson-content">Contenu</Label>
                          <Textarea
                            id="lesson-content"
                            className="min-h-[100px]"
                            value={lessonContent}
                            onChange={(e) => setLessonContent(e.target.value)}
                          />
                        </div>
                      </div>
                      {lessonStatus ? <p className="text-sm text-slate-600">{lessonStatus}</p> : null}
                      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button onClick={() => setShowAddLessonForm(false)} variant="secondary">
                          Annuler
                        </Button>
                        <Button onClick={createLesson} disabled={lessonSaving} className="bg-emerald-600 hover:bg-emerald-700">
                          {lessonSaving ? "Ajout en cours..." : "Ajouter la leçon"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Plan de cours</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {course.lessons && course.lessons.length > 0 ? (
                          course.lessons.slice().sort((a, b) => a.order_index - b.order_index).map((lesson, index) => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lesson)}
                              className={`w-full text-left rounded-2xl p-4 border ${selectedLesson?.id === lesson.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-slate-900">{index + 1}. {lesson.title}</p>
                                  {lesson.duration_minutes > 0 && (
                                    <p className="text-xs text-slate-500">{lesson.duration_minutes} min</p>
                                  )}
                                </div>
                                {selectedLesson?.id === lesson.id && <Badge className="bg-blue-100 text-blue-700">Actif</Badge>}
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="text-slate-400">Aucune leçon disponible.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    {selectedLesson ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-blue-600" /> {selectedLesson.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedLesson.video_url ? (
                            <video controls className="w-full rounded-2xl bg-black">
                              <source src={selectedLesson.video_url} type="video/mp4" />
                            </video>
                          ) : null}
                          {selectedLesson.content ? (
                            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson.content.replace(/\n/g, "<br/>") }} />
                          ) : (
                            <p className="text-slate-500">Cette leçon ne contient pas de contenu textuel.</p>
                          )}
                          {enrollment ? (
                            <Button onClick={() => markLessonComplete(selectedLesson)} className="bg-blue-600 hover:bg-blue-700">
                              Enregistrer la progression pour cette leçon
                            </Button>
                          ) : (
                            <p className="text-sm text-slate-500">Inscrivez-vous pour enregistrer la progression.</p>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent>
                          <p className="text-slate-500">Sélectionnez une leçon pour commencer.</p>
                        </CardContent>
                      </Card>
                    )}
                    {isInstructorOwner ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Ajouter une leçon</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="lesson-title">Titre</Label>
                            <Input
                              id="lesson-title"
                              value={lessonTitle}
                              onChange={(e) => setLessonTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lesson-content">Contenu</Label>
                            <Textarea
                              id="lesson-content"
                              className="min-h-[120px]"
                              value={lessonContent}
                              onChange={(e) => setLessonContent(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lesson-video">URL vidéo</Label>
                            <Input
                              id="lesson-video"
                              value={lessonUrl}
                              onChange={(e) => setLessonUrl(e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="lesson-duration">Durée (minutes)</Label>
                              <Input
                                id="lesson-duration"
                                type="number"
                                min="1"
                                value={lessonDuration}
                                onChange={(e) => setLessonDuration(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="lesson-order">Ordre</Label>
                              <Input
                                id="lesson-order"
                                type="number"
                                min="1"
                                value={lessonOrderIndex}
                                onChange={(e) => setLessonOrderIndex(e.target.value)}
                              />
                            </div>
                          </div>
                          {lessonStatus ? <p className="text-sm text-slate-600">{lessonStatus}</p> : null}
                          <Button onClick={createLesson} disabled={lessonSaving} className="bg-emerald-600 hover:bg-emerald-700">
                            {lessonSaving ? "Ajout en cours..." : "Ajouter la leçon"}
                          </Button>
                        </CardContent>
                      </Card>
                    ) : null}
                    {isInstructorOwner && selectedLesson ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Modifier la leçon sélectionnée</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="edit-lesson-title">Titre de la leçon</Label>
                            <Input
                              id="edit-lesson-title"
                              value={lessonEditTitle}
                              onChange={(e) => setLessonEditTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-lesson-content">Contenu</Label>
                            <Textarea
                              id="edit-lesson-content"
                              className="min-h-[120px]"
                              value={lessonEditContent}
                              onChange={(e) => setLessonEditContent(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-lesson-video">URL vidéo</Label>
                            <Input
                              id="edit-lesson-video"
                              value={lessonEditUrl}
                              onChange={(e) => setLessonEditUrl(e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-lesson-duration">Durée (minutes)</Label>
                              <Input
                                id="edit-lesson-duration"
                                type="number"
                                min="1"
                                value={lessonEditDuration}
                                onChange={(e) => setLessonEditDuration(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-lesson-order">Ordre</Label>
                              <Input
                                id="edit-lesson-order"
                                type="number"
                                min="1"
                                value={lessonEditOrderIndex}
                                onChange={(e) => setLessonEditOrderIndex(e.target.value)}
                              />
                            </div>
                          </div>
                          {lessonEditStatus ? <p className="text-sm text-slate-600">{lessonEditStatus}</p> : null}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button onClick={updateLesson} disabled={lessonEditSaving} className="bg-blue-600 hover:bg-blue-700">
                              {lessonEditSaving ? "Enregistrement..." : "Mettre à jour la leçon"}
                            </Button>
                            <Button variant="destructive" onClick={deleteLesson} disabled={lessonEditSaving}>
                              Supprimer la leçon
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quiz">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-600" /> Générer un quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">Choisissez une leçon et générez un quiz adapté à son contenu.</p>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="quiz-lesson">Leçon pour le quiz</Label>
                        <select
                          id="quiz-lesson"
                          className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                          value={quizLessonId ?? ""}
                          onChange={(e) => setQuizLessonId(Number(e.target.value))}
                        >
                          {(course.lessons || []).map((lesson) => (
                            <option key={lesson.id} value={lesson.id}>
                              {lesson.order_index}. {lesson.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        {quizLessonId ? (
                          course.lessons?.find((lesson) => lesson.id === quizLessonId)?.title || "Choisissez une leçon."
                        ) : (
                          "Choisissez d'abord une leçon pour générer le quiz."
                        )}
                      </div>
                      <Button onClick={generateQuiz} disabled={!quizLessonId || quizLoading} className="bg-purple-600 hover:bg-purple-700">
                        {quizLoading ? "Génération en cours..." : "Générer le quiz"}
                      </Button>
                    </div>
                    {quiz ? (
                      <div className="space-y-4">
                        {quiz.questions.map((question, index) => (
                          <Card key={index} className="border-slate-200 bg-slate-50">
                            <CardContent>
                              <p className="font-semibold">{index + 1}. {question.question}</p>
                              <div className="mt-3 space-y-2 text-sm text-slate-700">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className={`rounded-xl p-2 ${optionIndex === question.correct_answer ? "bg-green-100" : "bg-white"}`}>
                                    <span className="font-medium">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                                  </div>
                                ))}
                              </div>
                              <p className="mt-3 text-xs text-slate-500">Explication : {question.explanation}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" /> Recommandations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">Obtenez des recommandations de cours et d'objectifs basées sur votre apprentissage actuel.</p>
                    <Button onClick={loadRecommendations} disabled={recommendationLoading} className="bg-emerald-600 hover:bg-emerald-700">
                      {recommendationLoading ? "Chargement..." : "Obtenir des recommandations"}
                    </Button>
                    {recommendationReason ? <p className="text-slate-500 text-sm">Pourquoi : {recommendationReason}</p> : null}
                    {recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {recommendations.map((item, index) => (
                          <Card key={index} className="border-slate-200 bg-slate-50">
                            <CardContent>
                              <p className="font-semibold">{item.title || item.name || `Suggestion ${index + 1}`}</p>
                              <p className="text-sm text-slate-600 mt-2">{item.description || item.summary || item.reason || "Recommandé par l'IA."}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback">
                <FeedbackForm courseId={course.id} courseTitle={course.title} />
              </TabsContent>
            </Tabs>
          </div>

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