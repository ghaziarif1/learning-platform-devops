import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Bot, BarChart3, Zap } from "lucide-react";
import Navbar from "@/components/ui-custom/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
          Learn anything with <span className="text-blue-600">AI assistance</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          A microservices-based learning platform with an integrated AI tutor,
          personalized recommendations, and automated feedback analysis.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/courses">
            <Button size="lg" className="px-8">Browse Courses</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="px-8">Get Started Free</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: BookOpen, title: "Rich Course Catalog", desc: "Browse free and paid courses with search and filters.", color: "text-blue-600 bg-blue-100" },
            { icon: Bot, title: "AI Tutor", desc: "Get instant answers from a local AI tutor powered by Ollama.", color: "text-purple-600 bg-purple-100" },
            { icon: BarChart3, title: "Analytics", desc: "Track enrollments, views, and completion rates in real time.", color: "text-green-600 bg-green-100" },
            { icon: Zap, title: "n8n Automation", desc: "Automated feedback workflows powered by n8n.", color: "text-orange-600 bg-orange-100" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture badges */}
      <section className="bg-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-4">Built with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Next.js", "FastAPI", "Node.js", "PostgreSQL", "MongoDB", "Redis", "Docker", "Nginx", "n8n", "Ollama"].map(t => (
              <span key={t} className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}