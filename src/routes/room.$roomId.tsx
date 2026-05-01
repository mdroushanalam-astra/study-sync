import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { AIHelper } from "@/components/AIHelper";
import { RoomChat } from "@/components/RoomChat";
import { VideoStage } from "@/components/VideoStage";
import { InviteButton } from "@/components/InviteButton";
import { RoomRules } from "@/components/RoomRules";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/room/$roomId")({
  head: () => ({
    meta: [
      { title: "Study room — Techgram" },
      { name: "description", content: "Live focused study session." },
    ],
  }),
  component: Room,
});

type RoomData = { id: string; topic: string };

function Room() {
  const { roomId } = Route.useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [loadingRoom, setLoadingRoom] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/auth" });
  }, [user, loading, router]);

  // Load room + join + heartbeat
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, topic")
        .eq("id", roomId)
        .maybeSingle();
      if (!active) return;
      if (error || !data) {
        toast.error("Room not found");
        router.navigate({ to: "/dashboard" });
        return;
      }
      setRoom(data);

      // Join (upsert participant)
      await supabase
        .from("room_participants")
        .upsert(
          { room_id: roomId, user_id: user.id, left_at: null },
          { onConflict: "room_id,user_id" }
        );

      setLoadingRoom(false);
    })();

    return () => {
      active = false;
      // Mark left on unmount
      if (user) {
        supabase
          .from("room_participants")
          .update({ left_at: new Date().toISOString() })
          .eq("room_id", roomId)
          .eq("user_id", user.id)
          .then(() => {});
      }
    };
  }, [user, roomId, router]);

  // Realtime participant count
  useEffect(() => {
    const refresh = async () => {
      const { count } = await supabase
        .from("room_participants")
        .select("id", { count: "exact", head: true })
        .eq("room_id", roomId)
        .is("left_at", null);
      setParticipantCount(count ?? 0);
    };
    refresh();
    const ch = supabase
      .channel(`room-${roomId}-participants`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_participants", filter: `room_id=eq.${roomId}` },
        refresh
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [roomId]);

  if (loading || loadingRoom || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Room header */}
      <div className="border-b border-border bg-surface/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowLeft className="w-4 h-4" /></Link>
            </Button>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Studying</div>
              <h1 className="text-lg md:text-xl font-bold truncate">{room.topic}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span className="text-sm font-medium">{participantCount}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">studying</span>
            </div>
            <RoomRules />
            <InviteButton topic={room.topic} />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-[1fr_360px] gap-4 md:gap-6 h-full">
          {/* Left: video + timer */}
          <div className="flex flex-col gap-4 md:gap-6 min-h-0">
            <VideoStage roomId={roomId} participantCount={participantCount} />
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 min-h-[400px]">
              <PomodoroTimer />
              <div className="md:hidden lg:hidden">
                {/* placeholder column on md */}
              </div>
              <div className="min-h-[400px]">
                <RoomChat roomId={roomId} />
              </div>
            </div>
          </div>

          {/* Right: AI helper */}
          <div className="min-h-[600px] lg:h-[calc(100vh-220px)] lg:sticky lg:top-24">
            <AIHelper topic={room.topic} />
          </div>
        </div>
      </main>
    </div>
  );
}
