"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { feedbackAPI } from "@/lib/api";

export default function FeedbackForm({ courseId, courseTitle }: {
  courseId: number;
  courseTitle: string;
}) {
  const [rating, setRating]   = useState(0);
  const [hover, setHover]     = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    if (!rating) return;
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await feedbackAPI.submit({
        user_id:      user.id || "anonymous",
        course_id:    courseId,
        course_title: courseTitle,
        rating,
        comment,
      });
      setSubmitted(true);
    } catch {
      alert("Impossible d'envoyer votre avis.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <Card>
      <CardContent className="pt-6 text-center text-green-600 font-medium">
        ✅ Merci pour votre feedback !
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Donner votre avis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              <Star className={`h-7 w-7 transition-colors ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-300"
              }`} />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Partagez votre avis (facultatif)..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
        />
        <Button onClick={submit} disabled={!rating || loading} className="w-full">
          {loading ? "Envoi en cours..." : "Envoyer le feedback"}
        </Button>
      </CardContent>
    </Card>
  );
}