import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";
import { Course } from "@/lib/api";

export default function CourseCard({ course }: { course: Course }) {
  const levelColor: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
          <Badge className={levelColor[course.level] || "bg-slate-100"}>
            {course.level}
          </Badge>
        </div>
        {course.category && (
          <Badge variant="outline" className="w-fit text-xs">
            {course.category}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-slate-600 line-clamp-3">
          {course.description || "No description available."}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.lessons?.length || 0} lessons
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <span className="font-semibold text-blue-600">
          {course.is_free ? "Free" : `$${course.price}`}
        </span>
        <Link href={`/courses/${course.id}`}>
          <Button size="sm">View Course</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}