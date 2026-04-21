import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import "@fontsource/instrument-serif/400.css";
import "@fontsource/work-sans/300.css";
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
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
      { title: "MindBloom — A gentle space to breathe & talk" },
      {
        name: "description",
        content:
          "MindBloom is your calm AI companion for mental wellbeing — a soft, judgment-free space to share how you feel.",
      },
      { name: "author", content: "MindBloom" },
      { property: "og:title", content: "MindBloom — A gentle space to breathe & talk" },
      {
        property: "og:description",
        content: "Soft, kind conversations whenever you need a moment of calm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "MindBloom — A gentle space to breathe & talk" },
      { name: "description", content: "MindBloom Companion offers empathetic, non-judgmental mental health support." },
      { property: "og:description", content: "MindBloom Companion offers empathetic, non-judgmental mental health support." },
      { name: "twitter:description", content: "MindBloom Companion offers empathetic, non-judgmental mental health support." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f324318f-215e-4d4a-b8c7-7b9cc4bae37d/id-preview-d92bfebe--02da1453-66b4-4978-9c85-9f9f5b9aa632.lovable.app-1776757973677.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f324318f-215e-4d4a-b8c7-7b9cc4bae37d/id-preview-d92bfebe--02da1453-66b4-4978-9c85-9f9f5b9aa632.lovable.app-1776757973677.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  return <Outlet />;
}
