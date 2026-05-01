import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PRESETS = {
  "25/5": { focus: 25 * 60, brk: 5 * 60 },
  "50/10": { focus: 50 * 60, brk: 10 * 60 },
  "15/3": { focus: 15 * 60, brk: 3 * 60 },
} as const;

type PresetKey = keyof typeof PRESETS;

function chime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    o.start(); o.stop(ctx.currentTime + 0.65);
  } catch { /* ignore */ }
}

export function PomodoroTimer() {
  const [preset, setPreset] = useState<PresetKey>("25/5");
  const { focus: FOCUS, brk: BREAK } = PRESETS[preset];
  const [seconds, setSeconds] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer when preset changes
  useEffect(() => {
    setRunning(false);
    setMode("focus");
    setSeconds(PRESETS[preset].focus);
  }, [preset]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          const nextMode = mode === "focus" ? "break" : "focus";
          chime();
          toast.success(nextMode === "break" ? "Focus done — take a break!" : "Break over — back to focus!");
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(nextMode === "break" ? "Break time 🎉" : "Focus time 🎯", {
              body: nextMode === "break" ? "Great work — relax for a bit." : "Let's get back to it.",
            });
          }
          setMode(nextMode);
          return nextMode === "focus" ? PRESETS[preset].focus : PRESETS[preset].brk;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode, preset]);

  const start = () => {
    if (!running && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setRunning(!running);
  };

  const reset = () => {
    setRunning(false);
    setMode("focus");
    setSeconds(FOCUS);
  };

  const total = mode === "focus" ? FOCUS : BREAK;
  const progress = ((total - seconds) / total) * 100;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <div className="glass rounded-2xl p-6 text-center flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {mode === "focus" ? "Focus" : "Break"}
        </div>
        <div className="flex gap-1">
          {(Object.keys(PRESETS) as PresetKey[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                preset === p
                  ? "bg-gradient-brand text-white border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="text-5xl font-bold font-display text-gradient-brand mb-3 tabular-nums">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </div>
      <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-brand transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-center gap-2">
        <Button size="sm" variant="hero" onClick={start}>
          {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {running ? "Pause" : "Start focus"}
        </Button>
        <Button size="sm" variant="glow" onClick={reset}>
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
