"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const res = await authAPI.register(form);
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      window.location.href = "/courses";
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-600 rounded-full p-3">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-slate-500 text-sm">Start learning for free</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First Name</Label>
              <Input placeholder="Jean" value={form.firstName} onChange={update("firstName")} />
            </div>
            <div className="space-y-1.5">
              <Label>Last Name</Label>
              <Input placeholder="Dupont" value={form.lastName} onChange={update("lastName")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" placeholder="Min. 6 characters" value={form.password} onChange={update("password")} />
          </div>
          <Button className="w-full" onClick={submit} disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}