"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, LayoutDashboard, LogOut, User } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <BookOpen className="h-6 w-6 text-blue-600" />
          LearnPlatform
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="ghost" size="sm">Courses</Button>
          </Link>

          {user ? (
            <>
              {user.role === "admin" || user.role === "instructor" ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="h-4 w-4 mr-1" /> Dashboard
                  </Button>
                </Link>
              ) : null}
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <User className="h-4 w-4" /> {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}