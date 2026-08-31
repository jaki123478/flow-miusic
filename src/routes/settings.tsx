import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChromeBackgroundCard } from "@/components/flow/background-audio";
import {
  EMPTY_LASTFM,
  lastFmHandshake,
  readLastFmConfig,
  writeLastFmConfig,
  type LastFmConfig,
} from "@/lib/music/lastfm";
import { useFlowStore, DEFAULT_SETTINGS, type FlowSettings } from "@/stores/flow-store";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 rounded-lg px-1 py-3 text-left"
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-xs text-muted">{hint}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full ${on ? "bg-primary" : "bg-elevated"}`}>
        <span className={`absolute top-0.5 size-5 rounded-full bg-fg transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}

function SettingsPage() {
  const settings = useFlowStore((s) => s.settings);
  const patch = useFlowStore((s) => s.patchSettings);
  const listenMs = useFlowStore((s) => s.listenMs);
  const liked = useFlowStore((s) => s.liked.length);
  const recents = useFlowStore((s) => s.recents.length);
  const notify = useFlowStore((s) => s.notify);
  const hours = listenMs / 3_600_000;

  const set = (partial: Partial<FlowSettings>) => patch(partial);

  return (
    <div className="flow-enter mx-auto max-w-xl space-y-8 pb-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="mt-1 text-sm text-muted">Riproduzione, aspetto, lingua e privacy.</p>
      </header>

      <ChromeBackgroundCard />

      <section className="space-y-3 rounded-lg bg-surface px-4 py-3">
        <p className="text-sm font-medium">Tema</p>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => set({ theme })}
              className={`h-9 rounded-full px-4 text-sm font-medium ${
                settings.theme === theme ? "bg-primary text-primary-fg" : "bg-elevated"
              }`}
            >
              {theme === "dark" ? "Scuro" : "Chiaro"}
            </button>
          ))}
        </div>
        <p className="pt-2 text-sm font-medium">Lingua</p>
        <div className="flex gap-2">
          {(["it", "en"] as const).map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => set({ locale })}
              className={`h-9 rounded-full px-4 text-sm font-medium ${
                settings.locale === locale ? "bg-primary text-primary-fg" : "bg-elevated"
              }`}
            >
              {locale === "it" ? "Italiano" : "English"}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Link to="/stats" className="rounded-full bg-elevated px-4 py-2 text-sm font-medium">
          Stats
        </Link>
        <Link to="/discover" className="rounded-full bg-elevated px-4 py-2 text-sm font-medium">
          Scopri
        </Link>
        <Link to="/fresh" className="rounded-full bg-elevated px-4 py-2 text-sm font-medium">
          Novità
        </Link>
        <Link to="/friends" className="rounded-full bg-elevated px-4 py-2 text-sm font-medium">
          Amici
        </Link>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold text-muted">Ascolto</h2>
        <p className="text-3xl font-bold tabular-nums">{hours < 1 ? `${Math.round(listenMs / 60000)} min` : `${hours.toFixed(1)} ore`}</p>
        <p className="mt-1 text-sm text-muted">
          {liked} preferiti · {recents} recenti
        </p>
      </section>

      <section className="divide-y divide-border rounded-lg bg-surface px-4">
        <div className="py-3">
          <p className="text-sm font-medium">Crossfade</p>
          <p className="mb-3 text-xs text-muted">Dissolvenza tra un brano e il successivo (radio e audio nativo).</p>
          <div className="flex gap-2">
            {[0, 4, 8, 12].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set({ crossfade: n })}
                className={`h-9 rounded-full px-3 text-sm font-medium ${
                  settings.crossfade === n ? "bg-primary text-primary-fg" : "bg-elevated"
                }`}
              >
                {n === 0 ? "Off" : `${n}s`}
              </button>
            ))}
          </div>
        </div>
        <Toggle
          label="Normalizza volume"
          hint="Livello più costante tra brani e radio"
          on={settings.normalize}
          onChange={(v) => set({ normalize: v })}
        />
        <Toggle
          label="Tempo rimanente"
          hint="Nel player mostra quanto manca, non quanto è passato"
          on={settings.remainingTime}
          onChange={(v) => set({ remainingTime: v })}
        />
        <Toggle
          label="Flow DJ parla"
          hint="Il chatbot legge le risposte ad alta voce e puoi dettare col microfono"
          on={settings.voiceOn}
          onChange={(v) => set({ voiceOn: v })}
        />
      </section>

      <section className="rounded-lg bg-surface px-4 py-3">
        <p className="text-sm font-medium">Equalizzatore</p>
        <p className="mb-3 text-xs text-muted">Bassi e acuti sulla radio e sugli stream nativi.</p>
        <label className="mt-2 flex items-center gap-3 text-sm">
          Bassi
          <input
            type="range"
            min={-12}
            max={12}
            step={1}
            value={settings.eqBass}
            onChange={(e) => set({ eqBass: Number(e.target.value) })}
            className="seek flex-1"
          />
          <span className="w-8 text-right text-xs tabular-nums text-muted">{settings.eqBass}</span>
        </label>
        <label className="mt-2 flex items-center gap-3 text-sm">
          Acuti
          <input
            type="range"
            min={-12}
            max={12}
            step={1}
            value={settings.eqTreble}
            onChange={(e) => set({ eqTreble: Number(e.target.value) })}
            className="seek flex-1"
          />
          <span className="w-8 text-right text-xs tabular-nums text-muted">{settings.eqTreble}</span>
        </label>
      </section>

      <section className="divide-y divide-border rounded-lg bg-surface px-4">
        <Toggle
          label="Sessione privata"
          hint="Non salva i brani in Ascoltati di recente"
          on={settings.privateSession}
          onChange={(v) => set({ privateSession: v })}
        />
        <Toggle
          label="Nascondi contenuti explicit"
          hint="Filtra i brani marcati espliciti nelle liste"
          on={settings.hideExplicit}
          onChange={(v) => set({ hideExplicit: v })}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold text-muted">Scorciatoie</h2>
        <ul className="space-y-1 text-sm text-muted">
          <li>Spazio — play / pausa</li>
          <li>← → — 10 secondi · Shift + frecce — brano</li>
          <li>M muto · S casuale · R ripeti · F player · L testi · Q coda</li>
          <li>? — elenco scorciatoie</li>
        </ul>
      </section>

      <LastFmCard notify={notify} />

      <button
        type="button"
        onClick={() => {
          patch(DEFAULT_SETTINGS);
          notify("Impostazioni ripristinate");
        }}
        className="text-sm font-medium text-muted hover:text-fg"
      >
        Ripristina predefinite
      </button>
    </div>
  );
}


function LastFmCard({ notify }: { notify: (msg: string) => void }) {
  const [cfg, setCfg] = useState<LastFmConfig>(EMPTY_LASTFM);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setCfg(readLastFmConfig());
  }, []);

  const save = (next: LastFmConfig) => {
    setCfg(next);
    writeLastFmConfig(next);
  };

  return (
    <section className="space-y-3 rounded-lg bg-surface px-4 py-3">
      <p className="text-sm font-medium">Last.fm</p>
      <p className="text-xs text-muted">
        Scrobble con la tua API key e sessione. Crea una chiave su last.fm/api, poi collega l&apos;account. Discord RPC e Shazam non sono disponibili sul web.
      </p>
      <Toggle
        label="Abilita scrobble"
        hint="Invia brani ascoltati a Last.fm (min. 30s o 50% del brano)"
        on={cfg.enabled}
        onChange={(v) => save({ ...cfg, enabled: v })}
      />
      <label className="block text-xs text-muted">
        API key
        <input
          value={cfg.apiKey}
          onChange={(e) => save({ ...cfg, apiKey: e.target.value })}
          className="mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border"
          autoComplete="off"
        />
      </label>
      <label className="block text-xs text-muted">
        Shared secret
        <input
          type="password"
          value={cfg.apiSecret}
          onChange={(e) => save({ ...cfg, apiSecret: e.target.value })}
          className="mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border"
          autoComplete="off"
        />
      </label>
      <label className="block text-xs text-muted">
        Session key (opzionale se usi utente e password)
        <input
          value={cfg.sessionKey}
          onChange={(e) => save({ ...cfg, sessionKey: e.target.value })}
          className="mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border"
          autoComplete="off"
        />
      </label>
      <label className="block text-xs text-muted">
        Utente Last.fm
        <input
          value={cfg.username}
          onChange={(e) => save({ ...cfg, username: e.target.value })}
          className="mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border"
        />
      </label>
      <label className="block text-xs text-muted">
        Password (solo per ottenere la sessione, non viene salvata)
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border"
        />
      </label>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void lastFmHandshake({
            data: {
              apiKey: cfg.apiKey,
              apiSecret: cfg.apiSecret,
              username: cfg.username,
              password,
            },
          })
            .then((res) => {
              if (!res.ok) {
                notify(res.error);
                return;
              }
              save({ ...cfg, sessionKey: res.sessionKey, username: res.username, enabled: true });
              setPassword("");
              notify("Last.fm collegato");
            })
            .finally(() => setBusy(false));
        }}
        className="h-11 rounded-full bg-fg px-4 text-sm font-bold text-bg disabled:opacity-60"
      >
        {busy ? "Collego…" : cfg.sessionKey ? "Ricollega Last.fm" : "Collega Last.fm"}
      </button>
      {cfg.sessionKey ? <p className="text-xs text-primary">Sessione attiva{cfg.username ? ` · ${cfg.username}` : ""}</p> : null}
    </section>
  );
}
