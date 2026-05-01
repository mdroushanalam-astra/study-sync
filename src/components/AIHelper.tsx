import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

export function AIHelper({ topic }: { topic: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: `Hi! I'm your AI study buddy for **${topic}**. Ask me anything — explanations, quick quizzes, or notes.` },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: input };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content !== messages[messages.length - 1]?.content) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-helper`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          topic,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (resp.status === 429) { toast.error("Rate limit. Try again shortly."); setStreaming(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Add credits in Lovable Cloud."); setStreaming(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      // Initialize empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
              ));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("AI helper failed");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-sm">AI Study Buddy</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-gradient-brand text-white"
                : "bg-surface-elevated text-foreground border border-border"
            }`}>
              {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          disabled={streaming}
          className="text-sm"
        />
        <Button type="submit" size="icon" variant="hero" disabled={streaming || !input.trim()}>
          {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}
