import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Lost in the multiverse</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist or has drifted into another orbit.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white shadow-glow hover:opacity-90"
          >
            Back to Techgram
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Techgram — Study with the world, in real time" },
      { name: "description", content: "Find people studying the exact same topic as you, right now. AI helper, focus timer, and live study rooms." },
      { name: "author", content: "Techgram" },
      { property: "og:title", content: "Techgram — Study with the world, in real time" },
      { property: "og:description", content: "Find people studying the exact same topic as you, right now. AI helper, focus timer, and live study rooms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Techgram — Study with the world, in real time" },
      { name: "twitter:description", content: "Find people studying the exact same topic as you, right now. AI helper, focus timer, and live study rooms." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2a543ffe-7c5b-467f-bb9b-351a4a011697/id-preview-1f858678--c8d57975-dcc7-4417-9aa6-bcd353ddaf08.lovable.app-1777627099081.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2a543ffe-7c5b-467f-bb9b-351a4a011697/id-preview-1f858678--c8d57975-dcc7-4417-9aa6-bcd353ddaf08.lovable.app-1777627099081.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster theme="dark" position="top-right" />
    </AuthProvider>
  );
}
