import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

type Message = {
  id: string;
  user_id: string | null;
  author_name: string;
  content: string;
  is_ai: boolean;
  created_at: string;
};

export function RoomChat({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [authorName, setAuthorName] = useState("Learner");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data?.display_name) setAuthorName(data.display_name); });
  }, [user]);

  useEffect(() => {
    supabase
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => { if (data) setMessages(data as Message[]); });

    const ch = supabase
      .channel(`room-${roomId}-msgs`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const text = input;
    setInput("");
    await supabase.from("messages").insert({
      room_id: roomId,
      user_id: user.id,
      author_name: authorName,
      content: text,
      is_ai: false,
    });
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <span className="font-semibold text-sm">Room chat</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Quiet for now. Say hi 👋
          </p>
        ) : (
          messages.map((m) => {
            const isMe = m.user_id === user?.id;
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  isMe ? "bg-gradient-brand text-white" : "bg-surface-elevated border border-border"
                }`}>
                  {!isMe && (
                    <div className="text-xs text-muted-foreground mb-0.5 font-medium">{m.author_name}</div>
                  )}
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="text-sm" />
        <Button type="submit" size="icon" variant="hero" disabled={!input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
