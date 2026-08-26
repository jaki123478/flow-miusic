import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { mode?: "in" | "up" } => ({
    mode: search.mode === "up" ? "up" : search.mode === "in" ? "in" : undefined,
  }),
  component: Login,
});

function Login() {
  const { mode: start } = Route.useSearch();
  const [mode, setMode] = useState<"in" | "up">(start === "up" ? "up" : "in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!authEnabled) return;
    setBusy(true);
    setError(null);
    try {
      const res =
        mode === "up"
          ? await authClient.signUp.email({ email, password, name: name.trim() || email.split("@")[0] })
          : await authClient.signIn.email({ email, password });
      if (res.error) {
        setError(res.error.message || "Accesso non riuscito");
        return;
      }
      window.location.assign("/library");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accesso non riuscito");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary font-heading text-lg font-bold text-primary-fg">
          F
        </span>
        <span className="font-heading text-2xl font-bold">Flow</span>
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">{mode === "in" ? "Accedi" : "Registrati"}</h1>
      <p className="mt-2 text-sm text-muted">
        Crea un account per salvare playlist, preferiti e importare le tue liste da Spotify.
      </p>

      {!authEnabled ? (
        <p className="mt-6 text-sm text-muted">Accesso non disponibile in questo momento.</p>
      ) : (
        <>
          <div className="mt-6 space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => void signIn(p.providerId, { callbackURL: "/library", errorCallbackURL: "/login" })}
                className="flex h-12 w-full items-center justify-center rounded-full bg-fg text-sm font-bold text-bg hover:opacity-90"
              >
                Continua con {p.label}
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-subtle">
            <span className="h-px flex-1 bg-border" />
            oppure con email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={(e) => void onEmail(e)} className="space-y-3">
            {mode === "up" ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome"
                autoComplete="name"
                className="h-12 w-full rounded-lg bg-surface px-4 text-base outline-none ring-1 ring-border"
              />
            ) : null}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
              className="h-12 w-full rounded-lg bg-surface px-4 text-base outline-none ring-1 ring-border"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 8 caratteri)"
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              minLength={8}
              required
              className="h-12 w-full rounded-lg bg-surface px-4 text-base outline-none ring-1 ring-border"
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-full bg-primary text-sm font-bold text-primary-fg disabled:opacity-60"
            >
              {busy ? "Attendi…" : mode === "in" ? "Accedi" : "Crea account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "in" ? "up" : "in");
              setError(null);
            }}
            className="mt-5 text-sm text-muted hover:text-fg"
          >
            {mode === "in" ? "Non hai un account? Registrati gratis" : "Hai già un account? Accedi"}
          </button>
        </>
      )}
    </div>
  );
}
