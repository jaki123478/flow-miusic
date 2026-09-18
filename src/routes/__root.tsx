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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
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
  head: () => {
    const description =
      "Musica, radio live, playlist e testi. Scopri hit, mix e radio dal mondo — ascolta ovunque su Flow.";
    const siteUrl = "https://flow-music-web.vercel.app";
    const ogImage = `${siteUrl}/og.jpg`;
    const title = "Flow — Musica, radio e playlist";
    return {
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
        },
        { title },
        { name: "theme-color", content: "#000000" },
        { name: "description", content: description },
        {
          name: "keywords",
          content: "musica online, radio live, playlist, youtube music, ascolta gratis, hit italia, flow music",
        },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { name: "author", content: "Flow" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: APP_NAME },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "format-detection", content: "telephone=no" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Flow" },
        { property: "og:locale", content: "it_IT" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: siteUrl },
        { property: "og:image", content: ogImage },
        { property: "og:image:alt", content: "Flow Music" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: siteUrl },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/manifest.json" },
        { rel: "stylesheet", href: appCss },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&display=swap",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Flow",
            url: siteUrl,
            description,
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Web",
            inLanguage: "it-IT",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          }),
        },
      ],
    };
  },
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
