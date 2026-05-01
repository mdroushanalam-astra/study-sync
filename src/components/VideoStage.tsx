import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, VideoOff, MicOff, UserX, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function Stage() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout tracks={tracks} style={{ height: "100%" }}>
      <ParticipantTile />
    </GridLayout>
  );
}

function ModeratorPanel({ roomId, isModerator }: { roomId: string; isModerator: boolean }) {
  const participants = useParticipants();
  const room = useRoomContext();
  const [busy, setBusy] = useState(false);

  if (!isModerator) return null;

  const callModeration = async (action: "mute_all" | "remove_participant", targetIdentity?: string) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("room-moderate", {
        body: { roomId, action, targetIdentity },
      });
      if (error) throw error;
      if (action === "mute_all") toast.success(`Muted ${data?.muted ?? 0} participant(s)`);
      if (action === "remove_participant") toast.success("Participant removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const others = participants.filter((p) => p.identity !== room.localParticipant.identity);

  return (
    <div className="px-3 py-2 border-t border-border bg-surface/40 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-accent flex items-center gap-1">
        <ShieldAlert className="w-3 h-3" /> Host controls
      </span>
      <Button size="sm" variant="glow" disabled={busy || others.length === 0}
        onClick={() => callModeration("mute_all")}>
        <MicOff className="w-3 h-3" /> Mute all
      </Button>
      {others.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground">Remove:</span>
          {others.map((p) => (
            <Button key={p.identity} size="sm" variant="outline" disabled={busy}
              onClick={() => callModeration("remove_participant", p.identity)}
              className="h-7 text-xs">
              <UserX className="w-3 h-3" /> {p.name || p.identity.slice(0, 6)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VideoStage({ roomId }: { roomId: string; participantCount?: number }) {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connect, setConnect] = useState(false);

  useEffect(() => {
    if (!user || !connect) return;
    let active = true;
    (async () => {
      try {
        const displayName =
          (user.user_metadata?.display_name as string | undefined) ||
          (user.user_metadata?.full_name as string | undefined) ||
          user.email?.split("@")[0] ||
          "Learner";
        const { data, error } = await supabase.functions.invoke("livekit-token", {
          body: { roomId, displayName },
        });
        if (!active) return;
        if (error) throw error;
        if (!data?.token || !data?.url) throw new Error(data?.error || "Could not get token");
        setToken(data.token);
        setUrl(data.url);
        setIsModerator(!!data.isModerator);
      } catch (e) {
        if (!active) return;
        const msg = e instanceof Error ? e.message : "Failed to get token";
        setError(msg);
        toast.error(msg);
      }
    })();
    return () => { active = false; };
  }, [user, roomId, connect]);

  const reset = () => {
    setConnect(false);
    setToken(null);
    setUrl(null);
    setError(null);
  };

  if (!connect) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
          <VideoOff className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Join the video room</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Allow camera & microphone when your browser asks. Study live with others on this topic.
        </p>
        <button
          onClick={() => setConnect(true)}
          className="px-5 py-2.5 rounded-lg bg-gradient-brand text-white text-sm font-medium shadow-glow hover:opacity-90 transition"
        >
          Join video
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-sm text-destructive mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={reset}>Try again</Button>
      </div>
    );
  }

  if (!token || !url) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center min-h-[320px] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Connecting to video room…</p>
        <Button variant="ghost" size="sm" onClick={reset}>Cancel</Button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden" data-lk-theme="default">
      <LiveKitRoom
        token={token}
        serverUrl={url}
        connect={true}
        video={true}
        audio={true}
        style={{ height: "520px", display: "flex", flexDirection: "column" }}
        onDisconnected={reset}
        onError={(e) => {
          console.error("LiveKit error:", e);
          toast.error(`Video error: ${e.message}`);
        }}
        onMediaDeviceFailure={(failure) => {
          console.error("Media device failure:", failure);
          toast.error("Camera/mic blocked. Allow permissions in your browser and retry.");
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <Stage />
        </div>
        <RoomAudioRenderer />
        <ModeratorPanel roomId={roomId} isModerator={isModerator} />
        <ControlBar variation="minimal" controls={{ leave: true, screenShare: true }} />
      </LiveKitRoom>
    </div>
  );
}
