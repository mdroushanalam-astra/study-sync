# StudySync:  Real-Time WebRTC Collaborative Campus 🎓📹

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![LiveKit WebRTC](https://img.shields.io/badge/LiveKit-SFU%20WebRTC-FF4F00?style=for-the-badge&logo=webrtc)](https://livekit.io/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start%20%2B%20Query-FF4154?style=for-the-badge&logo=react-query)](https://tanstack.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Realtime-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**High-concurrency virtual study campus powered by Selective Forwarding Unit (SFU) WebRTC video meshes, synchronized distributed Pomodoro timers, and contextual AI study assistants.**

[System Architecture](#system-architecture) • [Key Engineering Modules](#key-engineering-modules) • [LiveKit Media Mesh](#livekit-webrtc-media-pipeline) • [Local Setup](#getting-started)

</div>

---

## ⚡ Overview

StudySync is an enterprise-grade virtual co-studying and collaborative environment designed for deep focus sessions. Rather than treating video calling as a standalone feature, StudySync integrates low-latency video feeds directly into a synchronized state machine coordinating focus blocks, break intervals, contextual AI tutoring, and participant presence.

```
       ┌────────────────────────────────────────────────────────┐
       │                   STUDYSYNC PLATFORM                   │
       └───────────────────────────┬────────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   LiveKit SFU    │      │ Distributed Sync │      │ AI Study Helper  │
│  WebRTC Video &  │      │ Pomodoro Timer & │      │ In-Room Chat &   │
│    Audio Grid    │      │ Room State Rules │      │ Context Guidance │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

## 🏛️ System Architecture

```
               [Client Browser A]                   [Client Browser B]
                       │                                    │
       WebRTC Media    │                    WebRTC Media    │
       (Opus / VP8)    │                    (Opus / VP8)    │
                       ▼                                    ▼
       ┌────────────────────────────────────────────────────────────┐
       │                 LIVEKIT SFU MEDIA SERVER                   │
       │        (Selective Forwarding Unit / Track Routing)         │
       └───────────────────────────────┬────────────────────────────┘
                                       │
                         WebSocket Signaling & State
                                       │
                                       ▼
       ┌────────────────────────────────────────────────────────────┐
       │                 SUPABASE REALTIME BACKEND                  │
       │   • Distributed Room Presence                              │
       │   • Synchronized Pomodoro State Machine (Work/Break)       │
       │   • Room Chat Channel Broadcasts                           │
       └────────────────────────────────────────────────────────────┘
```

---

## 🔬 Key Engineering Modules

### 1. High-Performance WebRTC Video Grid (`VideoStage.tsx`)
* Implements dynamic bandwidth-adaptive video tile layouts using `@livekit/components-react` and `livekit-client`.
* Automatically prioritizes active speakers while downscaling non-speaking tiles to preserve bandwidth during large study sessions.
* Seamless track subscription management and room audio renderers.

### 2. Distributed Pomodoro State Synchronization (`PomodoroTimer.tsx`)
* Server-clock synchronized timer ensuring all participants across disparate networks experience identical work/break intervals.
* Emits room-wide lifecycle events (session start, warning chime, break transition) to coordinate focus modes across all participant interfaces.

### 3. Integrated AI Study Companion (`AIHelper.tsx`)
* In-room contextual AI assistant capable of decomposing complex academic topics, generating instant flashcards, and summarizing study material directly within the focus view.

### 4. Interactive Presence & Room Moderation (`RoomChat.tsx`, `RoomRules.tsx`)
* Real-time text messaging with optimistic UI updates.
* Room contract enforcement (mic discipline, video etiquette, shared goals) integrated into the session lifecycle.

---

## 🛠️ Tech Stack Breakdown

- **Core Framework:** React 18, TanStack Start, TypeScript
- **Real-Time Video/Audio:** LiveKit Client & Components (`@livekit/components-react`, `livekit-client`)
- **Backend & State Sync:** Supabase (Auth, Realtime Postgres Changes, Database)
- **Styling & Components:** Tailwind CSS, Radix UI, shadcn/ui, Lucide Icons
- **Build & Optimization:** Vite with Cloudflare deployment optimization plugin

---

## 💻 Getting Started

### Prerequisites
* **Node.js**: v18+
* **Bun** or **npm**

### Installation
```bash
# 1. Clone repository
git clone https://github.com/mdroushanalam-astra/study-sync.git
cd study-sync

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env
# Configure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and LIVEKIT_URL

# 4. Run development server
npm run dev
```

Visit `http://localhost:5173` to join a collaborative study room.

---

<div align="center">
  <sub>Engineered by <a href="https://github.com/mdroushanalam-astra">Md. Roushan Alam</a></sub>
</div>
