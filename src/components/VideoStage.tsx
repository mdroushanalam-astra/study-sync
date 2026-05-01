import { Video, Mic, MicOff, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/**
 * Video/audio placeholder.
 * Wire LiveKit here once LIVEKIT_URL / API key / secret are added.
 * For now: shows participant tiles with controls (UI-only).
 */
export function VideoStage({ participantCount }: { participantCount: number }) {
  const [audio, setAudio] = useState(false);
  const [video, setVideo] = useState(false);

  return (
    <div className="glass rounded-2xl p-6 flex flex-col items-center">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-4">
        {Array.from({ length: Math.max(participantCount, 3) }).slice(0, 6).map((_, i) => (
          <div
            key={i}
            className="aspect-video rounded-xl bg-surface-elevated border border-border flex items-center justify-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-brand opacity-5" />
            <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow opacity-60">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/60 backdrop-blur px-2 py-0.5 rounded">
              {i === 0 ? "You" : `Learner ${i + 1}`}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant={audio ? "hero" : "glow"}
          onClick={() => setAudio(!audio)}
          title={audio ? "Mute mic" : "Unmute mic"}
        >
          {audio ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </Button>
        <Button
          size="icon"
          variant={video ? "hero" : "glow"}
          onClick={() => setVideo(!video)}
          title={video ? "Stop video" : "Start video"}
        >
          {video ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </Button>
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center max-w-md">
        Audio/video uses LiveKit. Add your <code className="text-accent">LIVEKIT_URL</code>, API key & secret in Cloud settings to activate.
      </p>
    </div>
  );
}
