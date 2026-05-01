import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const FOCUS = 25 * 60;
const BREAK = 5 * 60;

export function PomodoroTimer() {
  const [seconds, setSeconds] = useState(FOCUS);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // Switch mode
          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          return nextMode === "focus" ? FOCUS : BREAK;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

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
    <div className="glass rounded-2xl p-6 text-center">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {mode === "focus" ? "Focus" : "Break"}
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
        <Button size="sm" variant="hero" onClick={() => setRunning(!running)}>
          {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {running ? "Pause" : "Start"}
        </Button>
        <Button size="sm" variant="glow" onClick={reset}>
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
