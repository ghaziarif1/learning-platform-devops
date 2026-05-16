"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/ui-custom/Navbar";
import CourseEditor from "@/components/ui-custom/CourseEditor";
import { coursesAPI, Course } from "@/lib/api";

export default function EditCoursePage() {
  const params = useParams();
  const courseId = Number(params.id);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const loadCourse = async () => {
      try {
        const res = await coursesAPI.getById(courseId);
        setCourse(res.data);
      } catch {
        setError("Impossible de charger le cours.");
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(courseId)) {
      loadCourse();
    } else {
      setError("ID de cours invalide.");
      setLoading(false);
    }
  }, [courseId]);

  const isInstructorOwner = Boolean(
    user && course && (user.role === "admin" || (user.role === "instructor" && course.instructor_id === user.id))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Chargement du cours...</div>
      </div>
    );
  }

  if (!course || error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px:4 py-20 text-center">
          <p className="text-xl font-semibold text-slate-900">{error || "Cours introuvable."}</p>
        </div>
      </div>
    );
  }

  if (!isInstructorOwner) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-xl font-semibold text-slate-900">Accès interdit</p>
          <p className="mt-3 text-slate-600">Vous n’êtes pas autorisé à modifier ce cours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Modifier le cours</h1>
        <CourseEditor
          mode="edit"
          instructorId={user?.id ?? ""}
          course={course}
          onSuccess={() => router.push(`/courses/${course.id}`)}
          onCancel={() => router.push(`/courses/${course.id}`)}
        />
      </div>
    </div>
  );
}
