import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AccessToken } from "livekit-server-sdk";
import { z } from "zod";

const inputSchema = z.object({
  roomId: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100),
});

export const getLiveKitToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const url = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!url || !apiKey || !apiSecret) {
      throw new Error("LiveKit credentials are not configured");
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: data.displayName,
      ttl: 60 * 60, // 1 hour
    });
    at.addGrant({
      room: data.roomId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();
    return { token, url };
  });
