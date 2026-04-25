"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/ui-custom/Navbar";
import CourseCard from "@/components/ui-custom/CourseCard";
import { coursesAPI, Course } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses]     = useState<Course[]>([]);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("");
  const [level, setLevel]         = useState("");
  const [isFree, setIsFree]       = useState<boolean | undefined>();
  const [loading, setLoading]     = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (search)             params.search   = search;
      if (category)           params.category = category;
      if (level)              params.level    = level;
      if (isFree !== undefined) params.is_free = isFree;
      const res = await coursesAPI.getAll(params);
      setCourses(res.data);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Course Catalog</h1>
          <p className="text-slate-600 mt-1">Discover our courses and start learning today</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-8 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchCourses()}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white text-slate-700"
            value={level} onChange={e => setLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-white text-slate-700"
            value={isFree === undefined ? "" : String(isFree)}
            onChange={e => setIsFree(e.target.value === "" ? undefined : e.target.value === "true")}
          >
            <option value="">All Prices</option>
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </select>
          <Button onClick={fetchCourses} className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filter
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No courses found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        )}
      </div>
    </div>
  );
}