"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, CheckCircle, AlertTriangle, Copy } from "lucide-react";
import { coursesAPI, Course } from "@/lib/api";

export default function MediaUpload({
  course,
  onThumbnailUpdated,
}: {
  course: Course;
  onThumbnailUpdated?: (url: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>(course.thumbnail_url || "");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    setFile(selected || null);
    setStatus("");
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Veuillez sélectionner un fichier avant de télécharger.");
      return;
    }

    setUploading(true);
    setStatus("Uploading...");

    try {
      const response = await coursesAPI.uploadMedia(file);
      const url = response.data.url;
      setUploadedUrl(url);
      setStatus("Téléchargement réussi.");
      onThumbnailUpdated?.(url);
    } catch (error) {
      setStatus("Erreur pendant l'upload. Réessayez.");
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async () => {
    if (!uploadedUrl) return;
    await navigator.clipboard.writeText(uploadedUrl);
    setStatus("URL copiée dans le presse-papiers.");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <UploadCloud className="h-5 w-5 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Uploader un média</p>
          <p className="text-xs text-slate-500">Téléversez une image ou une vidéo dans MinIO et récupérez l’URL publique.</p>
        </div>
      </div>

      <div className="space-y-3">
        <Input type="file" accept="image/*,video/*" onChange={handleFileChange} />
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleUpload} disabled={uploading} className="bg-blue-600 hover:bg-blue-700">
            {uploading ? "Upload en cours..." : "Uploader dans MinIO"}
          </Button>
          {uploadedUrl ? (
            <Button variant="outline" onClick={handleCopy} disabled={!uploadedUrl}>
              <Copy className="h-4 w-4 mr-1" /> Copier l'URL
            </Button>
          ) : null}
        </div>
        {status ? (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            {status.includes("Erreur") ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <CheckCircle className="h-4 w-4 text-emerald-500" />}
            <span>{status}</span>
          </div>
        ) : null}
        {uploadedUrl ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 break-words text-xs text-slate-700">
            <span className="font-medium">URL:</span>
            <div>{uploadedUrl}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
