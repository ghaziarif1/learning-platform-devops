"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui-custom/Navbar";
import CourseEditor from "@/components/ui-custom/CourseEditor";

export default function CreateCoursePage() {
  const [user, setUser] = useState<{ id: string; role: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Chargement...</div>
      </div>
    );
  }

  if (!user || (user.role !== "instructor" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-xl font-semibold text-slate-900">Accès réservé aux instructeurs</p>
          <p className="mt-3 text-slate-600">Vous devez être connecté en tant qu'instructeur pour créer un cours.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Créer un nouveau cours</h1>
        <CourseEditor
          mode="create"
          instructorId={user.id}
          onSuccess={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}
