"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { aiAPI } from "@/lib/api";

interface Message { role: "user" | "assistant"; content: string; }

export default function AiChat({ courseId, courseTitle, courseDescription = "" }: {
  courseId: number;
  courseTitle: string;
  courseDescription?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hi! I'm your AI tutor for "${courseTitle}". Ask me anything! 🎓` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat({
        course_id: courseId,
        course_title: courseTitle,
        course_description: courseDescription,
        user_question: question,
        conversation_history: history,
      });
      const answer = res.data.answer || "Sorry, I couldn't generate an answer.";
      setMessages([...newMessages, { role: "assistant", content: answer }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Error connecting to AI tutor." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[450px]">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" /> AI Tutor
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`p-1.5 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0 ${
              msg.role === "assistant" ? "bg-blue-100" : "bg-slate-100"
            }`}>
              {msg.role === "assistant"
                ? <Bot className="h-4 w-4 text-blue-600" />
                : <User className="h-4 w-4 text-slate-600" />}
            </div>
            <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
              msg.role === "assistant"
                ? "bg-slate-100 text-slate-800"
                : "bg-blue-600 text-white"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="p-1.5 rounded-full h-7 w-7 bg-blue-100 flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="bg-slate-100 rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            </div>
          </div>
        )}
      </CardContent>

      <div className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask a question..."
          disabled={loading}
          className="text-sm"
        />
        <Button size="sm" onClick={send} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}