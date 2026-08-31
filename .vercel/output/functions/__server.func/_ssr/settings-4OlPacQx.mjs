import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as useCacheStats, C as androidBackgroundTips, D as isAppleMobile, E as isAndroid, H as DEFAULT_SETTINGS, I as clearAllDownloads, R as formatBytes, S as writeLastFmConfig, T as oemBatteryIntents, U as useFlowStore, b as lastFmHandshake, w as detectOem, x as readLastFmConfig, y as EMPTY_LASTFM } from "./router-CiV8_qBv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-4OlPacQx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function openHref(href) {
	const a = document.createElement("a");
	a.href = href;
	a.rel = "noopener";
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	a.remove();
}
function ChromeBackgroundCard() {
	const notify = useFlowStore((s) => s.notify);
	const [standalone, setStandalone] = (0, import_react.useState)(false);
	const [sound, setSound] = (0, import_react.useState)("unknown");
	const [install, setInstall] = (0, import_react.useState)(null);
	const android = isAndroid();
	const apple = isAppleMobile();
	const oem = android ? detectOem() : "other";
	const oemLabel = oem === "samsung" ? "Samsung" : oem === "motorola" ? "Motorola" : oem === "pixel" ? "Pixel" : oem === "xiaomi" ? "Xiaomi" : oem === "huawei" ? "Huawei" : oem === "oppo" ? "Oppo / OnePlus" : "Android";
	(0, import_react.useEffect)(() => {
		setStandalone(window.matchMedia("(display-mode: standalone)").matches || Boolean(navigator.standalone));
		const onPrompt = (e) => {
			e.preventDefault();
			setInstall(e);
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		navigator.permissions?.query({ name: "notifications" }).then((p) => {
			setSound(p.state === "denied" ? "denied" : p.state === "granted" ? "granted" : "unknown");
			p.onchange = () => setSound(p.state === "granted" ? "granted" : p.state === "denied" ? "denied" : "unknown");
		}).catch(() => {});
		return () => window.removeEventListener("beforeinstallprompt", onPrompt);
	}, []);
	const activate = async () => {
		try {
			if ("Notification" in window && Notification.permission !== "granted") {
				const perm = await Notification.requestPermission();
				setSound(perm === "granted" ? "granted" : perm === "denied" ? "denied" : "unknown");
			} else setSound("granted");
		} catch {}
		if (android) {
			notify(`Apri Batteria e metti Nessuna limitazione (${oemLabel})`);
			const first = oemBatteryIntents()[0];
			if (first) window.setTimeout(() => openHref(first.href), 200);
		} else notify("Notifiche attivate");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3 rounded-lg bg-surface px-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-medium",
				children: ["Audio a schermo spento · ", android ? oemLabel : apple ? "iPhone" : "Desktop"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Flow suona da una copia locale del brano. Samsung, Motorola e Pixel fermano Chrome se la batteria è ottimizzata."
			}),
			android ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "list-decimal space-y-1.5 pl-4 text-sm text-muted",
				children: androidBackgroundTips().map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, s))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void activate(),
						className: "h-10 rounded-full bg-primary px-4 text-sm font-bold text-primary-fg",
						children: "Apri batteria"
					}),
					oemBatteryIntents().map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => openHref(item.href),
						className: "h-10 rounded-full bg-elevated px-4 text-sm font-medium",
						children: item.label
					}, item.label)),
					install && !standalone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void install.prompt(),
						className: "h-10 rounded-full bg-elevated px-4 text-sm font-medium",
						children: "Installa app"
					}) : null
				]
			})] }) : apple ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Su iPhone: Condividi → Aggiungi a Home. Poi avvia Flow dalla icona, non da Safari."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Queste voci servono sui telefoni Android."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-subtle",
				children: [
					"Notifiche: ",
					sound === "granted" ? "ok" : sound === "denied" ? "bloccate" : "non ancora",
					standalone ? " · App installata" : android ? " · Ancora nel browser" : ""
				]
			})
		]
	});
}
function Toggle({ label, hint, on, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onChange(!on),
		className: "flex w-full items-center justify-between gap-4 rounded-lg px-1 py-3 text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 block text-xs text-muted",
			children: hint
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `relative h-6 w-11 shrink-0 rounded-full ${on ? "bg-primary" : "bg-elevated"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 size-5 rounded-full bg-fg transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}` })
		})]
	});
}
var EQ_PRESETS = [
	{
		id: "flat",
		label: "Flat",
		bass: 0,
		treble: 0
	},
	{
		id: "bass_boost",
		label: "Bass Boost",
		bass: 7,
		treble: 0
	},
	{
		id: "vocal",
		label: "Vocal",
		bass: -2,
		treble: 5
	},
	{
		id: "treble_boost",
		label: "Treble Boost",
		bass: -1,
		treble: 7
	},
	{
		id: "rock",
		label: "Rock",
		bass: 5,
		treble: 4
	},
	{
		id: "pop",
		label: "Pop",
		bass: 3,
		treble: 3
	},
	{
		id: "electronic",
		label: "Electronic",
		bass: 6,
		treble: 5
	}
];
function SettingsPage() {
	const settings = useFlowStore((s) => s.settings);
	const patch = useFlowStore((s) => s.patchSettings);
	const listenMs = useFlowStore((s) => s.listenMs);
	const liked = useFlowStore((s) => s.liked.length);
	const recents = useFlowStore((s) => s.recents.length);
	const notify = useFlowStore((s) => s.notify);
	const cache = useCacheStats();
	const [clearing, setClearing] = (0, import_react.useState)(false);
	const hours = listenMs / 36e5;
	const set = (partial) => patch(partial);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter mx-auto max-w-xl space-y-8 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-bold tracking-tight",
				children: "Impostazioni"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Riproduzione, aspetto, equalizzatore e memoria."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "space-y-2 rounded-xl bg-surface px-4 py-4 ring-1 ring-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-bold text-fg",
						children: "App Android (APK)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Installa l'app nativa standalone con background audio e notifiche lock-screen."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/Flow-Music.apk",
						download: "Flow-Music.apk",
						className: "flex h-10 shrink-0 items-center justify-center rounded-full bg-primary px-4 text-xs font-bold text-primary-fg shadow-md transition-transform hover:scale-105 active:scale-95",
						children: "Scarica APK"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChromeBackgroundCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3 rounded-lg bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Tema interfaccia"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							{
								id: "dark",
								label: "Scuro"
							},
							{
								id: "oled",
								label: "Nero OLED (AMOLED)"
							},
							{
								id: "light",
								label: "Chiaro"
							}
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => set({ theme: item.id }),
							className: `h-9 rounded-full px-4 text-sm font-medium transition-colors ${settings.theme === item.id ? "bg-primary text-primary-fg font-bold" : "bg-elevated text-muted hover:text-fg"}`,
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2 text-sm font-medium",
						children: "Lingua"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: ["it", "en"].map((locale) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => set({ locale }),
							className: `h-9 rounded-full px-4 text-sm font-medium ${settings.locale === locale ? "bg-primary text-primary-fg" : "bg-elevated"}`,
							children: locale === "it" ? "Italiano" : "English"
						}, locale))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/stats",
						className: "rounded-full bg-elevated px-4 py-2 text-sm font-medium",
						children: "Stats"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/discover",
						className: "rounded-full bg-elevated px-4 py-2 text-sm font-medium",
						children: "Scopri"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/fresh",
						className: "rounded-full bg-elevated px-4 py-2 text-sm font-medium",
						children: "Novità"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/friends",
						className: "rounded-full bg-elevated px-4 py-2 text-sm font-medium",
						children: "Amici"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 text-sm font-bold text-muted",
					children: "Ascolto"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-3xl font-bold tabular-nums",
					children: hours < 1 ? `${Math.round(listenMs / 6e4)} min` : `${hours.toFixed(1)} ore`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						liked,
						" preferiti · ",
						recents,
						" recenti"
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "divide-y divide-border rounded-lg bg-surface px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Crossfade"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-3 text-xs text-muted",
								children: "Dissolvenza tra un brano e il successivo (radio e audio nativo)."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: [
									0,
									4,
									8,
									12
								].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => set({ crossfade: n }),
									className: `h-9 rounded-full px-3 text-sm font-medium ${settings.crossfade === n ? "bg-primary text-primary-fg" : "bg-elevated"}`,
									children: n === 0 ? "Off" : `${n}s`
								}, n))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Autoplay infinito (Radio continua)",
						hint: "Quando la playlist/coda finisce, scopre e riproduce automaticamente brani simili",
						on: settings.autoplayRelated,
						onChange: (v) => set({ autoplayRelated: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Normalizza volume",
						hint: "Livello più costante tra brani e radio",
						on: settings.normalize,
						onChange: (v) => set({ normalize: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Tempo rimanente",
						hint: "Nel player mostra quanto manca, non quanto è passato",
						on: settings.remainingTime,
						onChange: (v) => set({ remainingTime: v })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Dimensione testi karaoke"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-xs text-muted",
								children: "Grandezza dei caratteri nella visualizzazione testi sincronizzati."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: [
									{
										id: "sm",
										label: "Piccolo"
									},
									{
										id: "md",
										label: "Medio"
									},
									{
										id: "lg",
										label: "Grande"
									},
									{
										id: "xl",
										label: "Molto grande"
									}
								].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => set({ lyricsFontSize: f.id }),
									className: `h-9 rounded-full px-3 text-xs font-medium ${settings.lyricsFontSize === f.id ? "bg-primary text-primary-fg font-bold" : "bg-elevated"}`,
									children: f.label
								}, f.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Flow DJ parla",
						hint: "Il chatbot legge le risposte ad alta voce e puoi dettare col microfono",
						on: settings.voiceOn,
						onChange: (v) => set({ voiceOn: v })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-4 rounded-lg bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Equalizzatore Audio"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Preset e regolazione frequenze (Flow Hi-Fi)."
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: EQ_PRESETS.map((p) => {
							const active = settings.eqPreset === p.id && settings.eqBass === p.bass && settings.eqTreble === p.treble;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => set({
									eqPreset: p.id,
									eqBass: p.bass,
									eqTreble: p.treble
								}),
								className: `h-8 rounded-full px-3 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-fg font-bold" : "bg-elevated text-muted hover:text-fg"}`,
								children: p.label
							}, p.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-2 flex items-center gap-3 text-sm",
						children: [
							"Bassi",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -12,
								max: 12,
								step: 1,
								value: settings.eqBass,
								onChange: (e) => set({
									eqBass: Number(e.target.value),
									eqPreset: "custom"
								}),
								className: "seek flex-1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 text-right text-xs tabular-nums text-muted",
								children: settings.eqBass > 0 ? `+${settings.eqBass}` : settings.eqBass
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-2 flex items-center gap-3 text-sm",
						children: [
							"Acuti",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: -12,
								max: 12,
								step: 1,
								value: settings.eqTreble,
								onChange: (e) => set({
									eqTreble: Number(e.target.value),
									eqPreset: "custom"
								}),
								className: "seek flex-1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 text-right text-xs tabular-nums text-muted",
								children: settings.eqTreble > 0 ? `+${settings.eqTreble}` : settings.eqTreble
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3 rounded-lg bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Memoria & Brani Offline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							"Hai ",
							cache.count,
							" brani salvati offline (",
							formatBytes(cache.bytes),
							" occupati)."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: clearing || cache.count === 0,
						onClick: () => {
							setClearing(true);
							clearAllDownloads().then(() => notify("Cache offline svuotata")).finally(() => setClearing(false));
						},
						className: "h-10 rounded-full bg-elevated px-4 text-xs font-semibold text-fg hover:bg-highlight disabled:opacity-50",
						children: clearing ? "Svuotamento…" : "Svuota cache brani offline"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "divide-y divide-border rounded-lg bg-surface px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Sessione privata",
					hint: "Non salva i brani in Ascoltati di recente",
					on: settings.privateSession,
					onChange: (v) => set({ privateSession: v })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					label: "Nascondi contenuti explicit",
					hint: "Filtra i brani marcati espliciti nelle liste",
					on: settings.hideExplicit,
					onChange: (v) => set({ hideExplicit: v })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold text-muted",
					children: "Scorciatoie"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-1 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Spazio — play / pausa" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "← → — 10 secondi · Shift + frecce — brano" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "M muto · S casuale · R ripeti · F player · L testi · Q coda" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "? — elenco scorciatoie" })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LastFmCard, { notify }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					patch(DEFAULT_SETTINGS);
					notify("Impostazioni ripristinate");
				},
				className: "text-sm font-medium text-muted hover:text-fg",
				children: "Ripristina predefinite"
			})
		]
	});
}
function LastFmCard({ notify }) {
	const [cfg, setCfg] = (0, import_react.useState)(EMPTY_LASTFM);
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setCfg(readLastFmConfig());
	}, []);
	const save = (next) => {
		setCfg(next);
		writeLastFmConfig(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-3 rounded-lg bg-surface px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "Last.fm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "Scrobble con la tua API key e sessione. Crea una chiave su last.fm/api, poi collega l'account. Discord RPC e Shazam non sono disponibili sul web."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				label: "Abilita scrobble",
				hint: "Invia brani ascoltati a Last.fm (min. 30s o 50% del brano)",
				on: cfg.enabled,
				onChange: (v) => save({
					...cfg,
					enabled: v
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["API key", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: cfg.apiKey,
					onChange: (e) => save({
						...cfg,
						apiKey: e.target.value
					}),
					className: "mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border",
					autoComplete: "off"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Shared secret", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "password",
					value: cfg.apiSecret,
					onChange: (e) => save({
						...cfg,
						apiSecret: e.target.value
					}),
					className: "mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border",
					autoComplete: "off"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Session key (opzionale se usi utente e password)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: cfg.sessionKey,
					onChange: (e) => save({
						...cfg,
						sessionKey: e.target.value
					}),
					className: "mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border",
					autoComplete: "off"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Utente Last.fm", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: cfg.username,
					onChange: (e) => save({
						...cfg,
						username: e.target.value
					}),
					className: "mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-xs text-muted",
				children: ["Password (solo per ottenere la sessione, non viene salvata)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "password",
					value: password,
					onChange: (e) => setPassword(e.target.value),
					className: "mt-1 h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg outline-none ring-1 ring-border"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: busy,
				onClick: () => {
					setBusy(true);
					lastFmHandshake({ data: {
						apiKey: cfg.apiKey,
						apiSecret: cfg.apiSecret,
						username: cfg.username,
						password
					} }).then((res) => {
						if (!res.ok) {
							notify(res.error);
							return;
						}
						save({
							...cfg,
							sessionKey: res.sessionKey,
							username: res.username,
							enabled: true
						});
						setPassword("");
						notify("Last.fm collegato");
					}).finally(() => setBusy(false));
				},
				className: "h-11 rounded-full bg-fg px-4 text-sm font-bold text-bg disabled:opacity-60",
				children: busy ? "Collego…" : cfg.sessionKey ? "Ricollega Last.fm" : "Collega Last.fm"
			}),
			cfg.sessionKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-primary",
				children: ["Sessione attiva", cfg.username ? ` · ${cfg.username}` : ""]
			}) : null
		]
	});
}
//#endregion
export { SettingsPage as component };
