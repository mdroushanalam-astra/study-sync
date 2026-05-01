import { ScrollText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const RULES = [
  { title: "Stay on topic", body: "Keep the conversation focused on what the room is studying." },
  { title: "Mics off when not speaking", body: "Reduce background noise so others can focus." },
  { title: "Be respectful", body: "No harassment, hate speech, or disruptive behaviour." },
  { title: "No inappropriate content", body: "Keep your camera, screen share, and chat school-safe." },
  { title: "No cheating", body: "Don't share answers to live exams or graded assessments." },
  { title: "Host can moderate", body: "The room creator can mute or remove anyone who breaks the rules." },
];

export function RoomRules() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <ScrollText className="w-3.5 h-3.5" />
          Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-accent" />
            Room rules
          </DialogTitle>
          <DialogDescription>
            A safe, focused study space for everyone.
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-3 mt-2">
          {RULES.map((r, i) => (
            <li key={r.title} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-brand text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
