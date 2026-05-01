import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

export function InviteButton({ topic }: { topic: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Study ${topic} on Techgram`,
          text: `Join me studying ${topic} live on Techgram`,
          url,
        });
      } catch { /* user cancelled */ }
    } else {
      copy();
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="glow" size="sm">
          <Share2 className="w-3.5 h-3.5" />
          Invite
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass border-border" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">Invite friends</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Anyone with this link can join your study room.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={url}
              className="flex-1 text-xs bg-surface border border-border rounded-md px-2 py-1.5 font-mono truncate"
              onFocus={(e) => e.target.select()}
            />
            <Button size="sm" variant="hero" onClick={copy}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button variant="glow" size="sm" className="w-full" onClick={nativeShare}>
              <Share2 className="w-3.5 h-3.5" />
              Share via…
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
