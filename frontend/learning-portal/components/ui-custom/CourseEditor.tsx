"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Course, coursesAPI } from "@/lib/api";

export default function CourseEditor({
  mode,
  instructorId,
  course,
  onSuccess,
  onCancel,
}: {
  mode: "create" | "edit";
  instructorId: string;
  course?: Course;
  onSuccess: (course: Course) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [category, setCategory] = useState(course?.category ?? "");
  const [level, setLevel] = useState(course?.level ?? "beginner");
  const [price, setPrice] = useState(course?.price?.toString() ?? "0");
  const [isFree, setIsFree] = useState(course?.is_free ?? true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(course?.title ?? "");
    setDescription(course?.description ?? "");
    setCategory(course?.category ?? "");
    setLevel(course?.level ?? "beginner");
    setPrice(course?.price?.toString() ?? "0");
    setIsFree(course?.is_free ?? true);
    setStatus("");
  }, [course]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setStatus("Le titre est requis.");
      return;
    }

    setSaving(true);
    setStatus("");

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || undefined,
      level: level || "beginner",
      is_free: isFree,
      price: isFree ? 0 : Number(price) || 0,
    };

    try {
      const response = mode === "create"
        ? await coursesAPI.create({ ...payload, instructor_id: instructorId })
        : await coursesAPI.update(course!.id, payload);

      onSuccess(response.data);
      setStatus(mode === "create" ? "Cours créé avec succès." : "Cours mis à jour avec succès.");
      if (mode === "create") {
        setTitle("");
        setDescription("");
        setCategory("");
        setLevel("beginner");
        setPrice("0");
        setIsFree(true);
      }
    } catch {
      setStatus("Impossible d'enregistrer le cours. Vérifiez les champs et réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">{mode === "create" ? "Créer un nouveau cours" : "Modifier le cours"}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {mode === "create"
            ? "Publiez un nouveau cours pour vos élèves."
            : "Mettez à jour le contenu et les métadonnées de ce cours."}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="course-title">Titre du cours</Label>
          <Input
            id="course-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex. Bootstrap en 30 jours"
          />
        </div>

        <div>
          <Label htmlFor="course-description">Description</Label>
          <Textarea
            id="course-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Résumé du cours pour vos apprenants"
            className="min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="course-category">Catégorie</Label>
            <Input
              id="course-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Ex. Dev, Design, Business"
            />
          </div>

          <div>
            <Label htmlFor="course-level">Niveau</Label>
            <select
              id="course-level"
              className="mt-2 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              value={level}
              onChange={e => setLevel(e.target.value)}
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
              id="course-free"
              type="checkbox"
              checked={isFree}
              onChange={e => setIsFree(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <label htmlFor="course-free" className="text-sm text-slate-700">Cours gratuit</label>
          </div>
          <div>
            <Label htmlFor="course-price">Prix du cours</Label>
            <Input
              id="course-price"
              value={price}
              onChange={e => setPrice(e.target.value)}
              type="number"
              min="0"
              step="0.01"
              disabled={isFree}
              placeholder="0.00"
            />
          </div>
        </div>

        {status ? <p className="text-sm text-slate-600">{status}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "Enregistrement..." : mode === "create" ? "Créer le cours" : "Enregistrer les modifications"}
          </Button>
          {onCancel ? (
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              Annuler
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
