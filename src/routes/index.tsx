import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Brain, Timer, Video, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Techgram — Live study rooms with AI" },
      { name: "description", content: "Find people studying the exact same topic as you, right now. Live rooms, AI helper, focus timer." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

        {/* Orbital decorations */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="relative w-[600px] h-[600px] opacity-30">
            <div className="absolute inset-0 rounded-full border border-brand-purple/30 animate-orbit-slow" />
            <div className="absolute inset-12 rounded-full border border-brand-blue/30 animate-orbit-fast" />
            <div className="absolute inset-24 rounded-full border border-brand-cyan/20 animate-orbit-slow" />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-float">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-medium text-muted-foreground">AI-Powered Study Rooms</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Study with the world,
            <br />
            <span className="text-gradient-brand">in real time.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Find people studying the exact same topic as you, right now. Join a live room with an AI helper, focus timer, and chat — like a global library.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth">Start studying free</Link>
            </Button>
            <Button variant="glow" size="xl" asChild>
              <Link to="/dashboard">Find a room</Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: "AI", label: "Study buddy" },
              { value: "Live", label: "Real-time rooms" },
              { value: "Focus", label: "Pomodoro built-in" },
              { value: "Free", label: "To get started" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-gradient-brand font-display">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">
              Everything you need to <span className="text-gradient-brand">stay focused.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Built for students who want structure, accountability, and instant help — without the loneliness of studying alone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Smart Matching", desc: "Type your topic. We connect you with others studying the same thing right now." },
              { icon: Brain, title: "AI Helper", desc: "Stuck on a concept? Ask the room's AI. Get explanations, quizzes, and notes instantly." },
              { icon: Timer, title: "Focus Timer", desc: "Built-in Pomodoro. Everyone in the room studies in sync. Real momentum." },
              { icon: MessageSquare, title: "Group Chat", desc: "Quiet by default. Type when you have a doubt. Help each other learn." },
              { icon: Video, title: "Audio & Video", desc: "Optional camera and mic. Like sitting in a library together — but virtual." },
              { icon: Sparkles, title: "Library Vibe", desc: "No noise, no distractions. Just focused minds working in parallel." },
            ].map((f) => (
              <div
                key={f.title}
                className="glass rounded-2xl p-6 hover:border-brand-purple/40 transition-all hover:shadow-glow group"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 shadow-elevated">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to find your <span className="text-gradient-brand">study orbit?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join Techgram and stop studying alone.
          </p>
          <Button variant="hero" size="xl" asChild className="mt-8">
            <Link to="/auth">Get started — it's free</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        <p>© 2026 Techgram. The metaverse of learning.</p>
      </footer>
    </div>
  );
}
