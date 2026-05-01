// Moderator actions (mute all, remove participant) for a LiveKit room.
// Only the room creator (verified server-side) can perform these.
import { RoomServiceClient } from "https://esm.sh/livekit-server-sdk@2.13.1?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { roomId, action, targetIdentity } = body as {
      roomId: string;
      action: "mute_all" | "remove_participant";
      targetIdentity?: string;
    };

    // Verify moderator
    const { data: room } = await supabase
      .from("rooms").select("created_by").eq("id", roomId).maybeSingle();
    if (!room || room.created_by !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Only the room creator can do this" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("LIVEKIT_URL")!;
    const apiKey = Deno.env.get("LIVEKIT_API_KEY")!;
    const apiSecret = Deno.env.get("LIVEKIT_API_SECRET")!;
    // RoomServiceClient needs https URL, not wss
    const httpUrl = url.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
    const svc = new RoomServiceClient(httpUrl, apiKey, apiSecret);

    if (action === "mute_all") {
      const participants = await svc.listParticipants(roomId);
      let muted = 0;
      for (const p of participants) {
        if (p.identity === userData.user.id) continue; // don't mute self
        for (const track of p.tracks) {
          if (track.source === 1 /* MICROPHONE */ && !track.muted) {
            try {
              await svc.mutePublishedTrack(roomId, p.identity, track.sid, true);
              muted++;
            } catch (e) {
              console.error("mute fail", e);
            }
          }
        }
      }
      return new Response(JSON.stringify({ ok: true, muted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove_participant") {
      if (!targetIdentity) {
        return new Response(JSON.stringify({ error: "targetIdentity required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await svc.removeParticipant(roomId, targetIdentity);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("room-moderate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
