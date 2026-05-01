import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { normalizeTopic } from "@/lib/topic";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Techgram" },
      { name: "description", content: "Pick a topic and join a live study room." },
    ],
  }),
  component: Dashboard,
});

type ActiveRoom = {
  id: string;
  topic: string;
  topic_normalized: string;
  participant_count: number;
};

function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [rooms, setRooms] = useState<ActiveRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/auth" });
  }, [user, loading, router]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    const { data: roomsData } = await supabase
      .from("rooms")
      .select("id, topic, topic_normalized")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!roomsData) {
      setRooms([]);
      setLoadingRooms(false);
      return;
    }

    // Count active participants per room
    const enriched: ActiveRoom[] = await Promise.all(
      roomsData.map(async (r) => {
        const { count } = await supabase
          .from("room_participants")
          .select("id", { count: "exact", head: true })
          .eq("room_id", r.id)
          .is("left_at", null);
        return { ...r, participant_count: count ?? 0 };
      })
    );
    setRooms(enriched.filter((r) => r.participant_count > 0 || true));
    setLoadingRooms(false);
  };

  useEffect(() => {
    if (!user) return;
    loadRooms();
    const ch = supabase
      .channel("rooms-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, loadRooms)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_participants" }, loadRooms)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const startStudying = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic.trim()) return;
    setBusy(true);
    try {
      const normalized = normalizeTopic(topic);

      // Try to find an existing active room with same normalized topic
      const { data: existing } = await supabase
        .from("rooms")
        .select("id")
        .eq("topic_normalized", normalized)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let roomId = existing?.id;

      if (!roomId) {
        const { data: created, error } = await supabase
          .from("rooms")
          .insert({ topic: topic.trim(), topic_normalized: normalized, created_by: user.id })
          .select("id")
          .single();
        if (error) throw error;
        roomId = created.id;
      }

      router.navigate({ to: "/room/$roomId", params: { roomId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start session");
    } finally {
      setBusy(false);
    }
  };

  const joinRoom = (roomId: string) => {
    router.navigate({ to: "/room/$roomId", params: { roomId } });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs text-muted-foreground">Welcome back, {user.email?.split("@")[0]}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            What are you <span className="text-gradient-brand">studying today?</span>
          </h1>
          <p className="mt-3 text-muted-foreground">Type any topic. We'll match you with others studying the same thing.</p>
        </div>

        <form onSubmit={startStudying} className="glass rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-elevated">
          <Label htmlFor="topic" className="text-base">Your topic</Label>
          <div className="mt-3 flex gap-2">
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Trigonometry, Binary Trees, JEE Physics..."
              className="text-base h-12"
              autoFocus
              required
            />
            <Button type="submit" variant="hero" size="lg" disabled={busy || !topic.trim()}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Start
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            We'll find an active room with the same topic, or create a new one for you.
          </p>
        </form>

        {/* Active rooms */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Live rooms now</h2>
            <span className="text-sm text-muted-foreground">{rooms.length} active</span>
          </div>

          {loadingRooms ? (
            <div className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : rooms.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active rooms yet. Start one above!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => joinRoom(r.id)}
                  className="glass rounded-xl p-5 text-left hover:border-brand-purple/40 hover:shadow-glow transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{r.topic}</h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>{r.participant_count} studying</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
