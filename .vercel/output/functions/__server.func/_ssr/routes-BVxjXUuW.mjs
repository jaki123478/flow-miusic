import { i as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as GENRES } from "./types-CuQ6ClJX.mjs";
import { _ as Pause, g as Play, i as Trophy, s as Sparkles, w as Compass } from "../_libs/lucide-react.mjs";
import { c as HScroll, d as TrackArt, f as TrackCard, h as greetingIt, l as QuickTile, m as useFlowStore, p as TrackRow, s as Route$7, u as SectionHeader, v as stationToTrack } from "./router-CHLvWwov.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BVxjXUuW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { trending, hitsMix, independent, radios } = Route$7.useLoaderData();
	const [hello, setHello] = (0, import_react.useState)("Ciao");
	(0, import_react.useEffect)(() => {
		setHello(greetingIt());
	}, []);
	const recents = useFlowStore((s) => s.recents);
	const playTrack = useFlowStore((s) => s.playTrack);
	const playQueue = useFlowStore((s) => s.playQueue);
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const hero = trending[0];
	const quick = (recents.length ? recents : trending).slice(0, 6);
	const radioTracks = radios.map(stationToTrack);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: hello
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-0.5 text-2xl font-semibold tracking-tight md:text-3xl",
					children: "Cosa vuoi ascoltare?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-subtle",
					children: "YouTube Music · testi SimpMusic"
				})
			] }),
			hero ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "relative overflow-hidden rounded-2xl bg-surface ring-1 ring-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-36 shrink-0 overflow-hidden rounded-xl bg-elevated shadow-lg sm:size-44",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
							src: hero.artwork,
							alt: hero.title
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium tracking-widest text-primary uppercase",
								children: "In primo piano"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-xl font-semibold tracking-tight sm:text-3xl",
								children: hero.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: hero.artist
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => current?.id === hero.id ? togglePlay() : playTrack(hero, trending),
									className: "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg",
									children: current?.id === hero.id && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-current" }), " In riproduzione"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-current" }), " Riproduci"] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/charts",
									className: "inline-flex h-11 items-center gap-2 rounded-full bg-elevated px-4 text-sm font-medium text-fg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4" }), " Classifiche"]
								})]
							})
						]
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted ring-1 ring-border",
				children: "Catalogo in aggiornamento. Prova Radio o Cerca."
			}),
			quick.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Accesso rapido" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2.5 sm:grid-cols-3",
				children: quick.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickTile, {
					track: t,
					queue: quick
				}, t.id))
			})] }) : null,
			trending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Tendenze del momento",
				action: "Riproduci",
				onAction: () => playQueue(trending, 0)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: trending.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track: t,
				queue: trending
			}, t.id)) })] }) : null,
			radioTracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Radio dal mondo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: radioTracks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track: t,
				queue: radioTracks
			}, t.id)) })] }) : null,
			hitsMix.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "In evidenza",
				action: "Riproduci",
				onAction: () => playQueue(hitsMix, 0)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl bg-surface p-2 ring-1 ring-border sm:p-3",
				children: hitsMix.slice(0, 6).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
					track: t,
					queue: hitsMix,
					index: i,
					showIndex: true
				}, t.id))
			})] }) : null,
			independent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Nuove uscite" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: independent.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track: t,
				queue: independent
			}, t.id)) })] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Generi" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4",
				children: GENRES.slice(0, 8).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					search: { genre: g.id },
					className: "flex h-20 items-end rounded-xl bg-elevated p-3 ring-1 ring-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold",
						children: g.name
					})
				}, g.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/mix",
					className: "flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-11 items-center justify-center rounded-xl bg-elevated text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-semibold",
						children: "Mix intelligente"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Un mix su misura per il tuo umore"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/explore",
					className: "flex items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-11 items-center justify-center rounded-xl bg-elevated text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-semibold",
						children: "Esplora"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Mood, generi e scene dal mondo"
					})] })]
				})]
			})
		]
	});
}
//#endregion
export { Home as component };
