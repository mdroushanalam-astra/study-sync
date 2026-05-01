import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { useServerFn } from "@tanstack/react-start";
import { getLiveKitToken } from "@/server/livekit.functions";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, VideoOff } from "lucide-react";

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

export function VideoStage({ roomId }: { roomId: string; participantCount?: number }) {
  const { user } = useAuth();
  const fetchToken = useServerFn(getLiveKitToken);
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
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
        const res = await fetchToken({ data: { roomId, displayName } });
        if (!active) return;
        setToken(res.token);
        setUrl(res.url);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to get token");
      }
    })();
    return () => {
      active = false;
    };
  }, [user, roomId, connect, fetchToken]);

  if (!connect) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[320px]">
        <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow mb-4">
          <VideoOff className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Join the video room</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Turn on your camera & mic to study live with others on this topic.
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
      <div className="glass rounded-2xl p-6 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!token || !url) {
    return (
      <div className="glass rounded-2xl p-8 flex items-center justify-center min-h-[320px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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
        style={{ height: "480px" }}
        onDisconnected={() => setConnect(false)}
      >
        <div style={{ height: "calc(100% - 60px)" }}>
          <Stage />
        </div>
        <RoomAudioRenderer />
        <ControlBar variation="minimal" controls={{ leave: true, screenShare: true }} />
      </LiveKitRoom>
    </div>
  );
}
