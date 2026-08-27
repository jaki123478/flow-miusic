import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/flow/shell";
import appCss from "../styles.css?url";

const APP_NAME = "Flow";

export const Route = createRootRoute({
  errorComponent: ({ error }) => (
    <html lang="it">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>Flow</title>
      </head>
      <body className="antialiased">
        <div className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
          <div className="max-w-sm text-center">
            <p className="font-heading text-2xl font-bold">Flow</p>
            <p className="mt-2 text-sm text-muted">Qualcosa è andato storto. Ricarica e riprova.</p>
            <a href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-fg">
              Torna alla home
            </a>
            {error?.message ? <p className="mt-4 text-xs text-subtle">{error.message}</p> : null}
          </div>
        </div>
      </body>
    </html>
  ),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: APP_NAME },
      { name: "theme-color", content: "#000000" },
      {
        name: "description",
        content: "Musica, radio live e testi. Ascolta ovunque, anche sul telefono.",
      },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="it" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <AppShell>
            <Outlet />
          </AppShell>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
