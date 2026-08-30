import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as MOODS, r as GENRES } from "./types-CuQ6ClJX.mjs";
import { p as stationToTrack } from "./catalog-CGOj_o-p.mjs";
import { b as Play, c as Sparkles, j as Compass, x as Pause } from "../_libs/lucide-react.mjs";
import { C as TrackRow, D as greetingIt, E as cn, O as hashHue, S as TrackCard, T as useFlowStore, _ as CollectionCard, b as SectionHeader, d as Route$19, v as HScroll, x as TrackArt, y as QuickTile } from "./router-2cWS5y1K.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CPmUb8kU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { trending, hitsMix, independent, radios } = Route$19.useLoaderData();
	const [hello, setHello] = (0, import_react.useState)("Ciao");
	(0, import_react.useEffect)(() => {
		setHello(greetingIt());
	}, []);
	const recents = useFlowStore((s) => s.recents);
	const liked = useFlowStore((s) => s.liked);
	const playTrack = useFlowStore((s) => s.playTrack);
	const playQueue = useFlowStore((s) => s.playQueue);
	const current = useFlowStore((s) => s.current);
	const isPlaying = useFlowStore((s) => s.isPlaying);
	const togglePlay = useFlowStore((s) => s.togglePlay);
	const playlists = useFlowStore((s) => s.playlists);
	const trackMap = useFlowStore((s) => s.trackMap);
	const navigate = useNavigate();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const hero = trending[0];
	const quick = (recents.length ? recents : trending).slice(0, 6);
	const radioTracks = radios.map(stationToTrack);
	const daily = (0, import_react.useMemo)(() => {
		const pool = [
			...recents,
			...liked,
			...trending,
			...hitsMix
		];
		const seen = /* @__PURE__ */ new Set();
		const out = [];
		for (const t of pool) {
			if (seen.has(t.id)) continue;
			seen.add(t.id);
			out.push(t);
			if (out.length >= 12) break;
		}
		return out;
	}, [
		recents,
		liked,
		trending,
		hitsMix
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-8 pb-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight md:text-4xl",
					children: hello
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex gap-2",
					children: [
						["all", "Tutto"],
						["music", "Musica"],
						["radio", "Radio"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilter(id),
						className: cn("chip h-8 rounded-full px-4 text-sm font-medium", filter === id ? "bg-fg text-bg" : "bg-elevated text-fg"),
						children: label
					}, id))
				})]
			}),
			filter !== "radio" && quick.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 xl:grid-cols-3",
				children: quick.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickTile, {
					track: t,
					queue: quick
				}, t.id))
			}) }) : null,
			filter !== "radio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Fatto per te" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HScroll, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionCard, {
					title: "Mix del giorno",
					subtitle: "Aggiornato per te",
					artwork: daily[0]?.artwork,
					onPlay: () => daily.length && playQueue(daily, 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionCard, {
					title: "Scopri",
					subtitle: "Mix dai tuoi artisti",
					artwork: liked[1]?.artwork || recents[1]?.artwork,
					onPlay: () => void navigate({ to: "/discover" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionCard, {
					title: "Novità",
					subtitle: "Uscite fresche",
					artwork: independent[0]?.artwork || trending[0]?.artwork,
					onPlay: () => void navigate({ to: "/fresh" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionCard, {
					title: "Brani che ti piacciono",
					subtitle: `${liked.length} brani`,
					artwork: liked[0]?.artwork,
					onPlay: () => liked.length && playQueue(liked, 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionCard, {
					title: "Mix intelligente",
					subtitle: "In base al tuo umore",
					artwork: hitsMix[0]?.artwork || trending[1]?.artwork,
					onPlay: () => void navigate({ to: "/mix" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionCard, {
					title: "Classifiche",
					subtitle: "Cosa ascolta il mondo",
					artwork: trending[0]?.artwork,
					onPlay: () => trending.length && playQueue(trending, 0)
				}),
				playlists.slice(0, 4).map((p) => {
					const cover = p.trackIds.map((id) => trackMap[id]).find(Boolean);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollectionCard, {
						title: p.title,
						subtitle: `Playlist · ${p.trackIds.length}`,
						artwork: cover?.artwork,
						onPlay: () => {
							const tracks = p.trackIds.map((id) => trackMap[id]).filter(Boolean);
							if (tracks.length) playQueue(tracks, 0);
						}
					}, p.id);
				})
			] })] }) : null,
			filter !== "radio" && hero ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 opacity-40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: hero.artwork,
						alt: "",
						referrerPolicy: "no-referrer",
						className: "size-full scale-110 object-cover blur-3xl"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "art-shadow size-40 shrink-0 overflow-hidden rounded sm:size-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
							src: hero.artwork,
							alt: hero.title
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold tracking-widest text-fg uppercase",
								children: "Playlist in evidenza"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-heading text-3xl font-bold tracking-tight sm:text-5xl",
								children: hero.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: hero.artist
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex flex-wrap items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => current?.id === hero.id ? togglePlay() : playTrack(hero, trending),
									className: "play-fab inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-fg sm:size-16",
									"aria-label": "Riproduci",
									children: current?.id === hero.id && isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-6 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-6 fill-current" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/charts",
									className: "text-sm font-bold text-muted hover:text-fg",
									children: "Vai alle classifiche"
								})]
							})
						]
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg bg-elevated px-4 py-8 text-center text-sm text-muted",
				children: "Catalogo in aggiornamento. Prova Radio o Cerca."
			}),
			filter !== "radio" && daily.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Mix del giorno",
				action: "Riproduci",
				onAction: () => playQueue(daily, 0)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md bg-elevated/50 p-2",
				children: daily.slice(0, 5).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
					track: t,
					queue: daily,
					index: i,
					showIndex: true
				}, t.id))
			})] }) : null,
			filter !== "radio" && trending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Tendenze del momento",
				action: "Riproduci",
				onAction: () => playQueue(trending, 0)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: trending.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track: t,
				queue: trending
			}, t.id)) })] }) : null,
			filter !== "radio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Mood" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: MOODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/mix",
					search: { mood: m.id },
					className: "chip rounded-full bg-elevated px-4 py-2 text-sm font-medium ring-1 ring-border hover:bg-surface",
					children: m.label
				}, m.id))
			})] }) : null,
			filter !== "music" && radioTracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Radio dal mondo" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: radioTracks.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
					track: t,
					queue: radioTracks
				}, t.id)) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/radio",
					className: "mt-3 inline-block text-xs font-medium text-muted hover:text-fg",
					children: "Tutte le emittenti"
				})
			] }) : null,
			filter !== "radio" && hitsMix.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "In evidenza",
				action: "Riproduci",
				onAction: () => playQueue(hitsMix, 0)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl bg-surface p-2 ring-1 ring-border sm:p-3",
				children: hitsMix.slice(0, 6).map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
					track: t,
					queue: hitsMix,
					index: i,
					showIndex: true
				}, t.id))
			})] }) : null,
			filter !== "radio" && independent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Nuove uscite" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: independent.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track: t,
				queue: independent
			}, t.id)) })] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Generi" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4",
				children: GENRES.slice(0, 8).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					search: { genre: g.id },
					className: "flex h-24 items-end rounded-lg p-3",
					style: { backgroundColor: `hsl(${hashHue(g.id)} 55% 32%)` },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-bold",
						children: g.name
					})
				}, g.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/mix",
					className: "quick-tile flex items-center gap-3 rounded-lg bg-elevated p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-11 items-center justify-center rounded-lg bg-elevated text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-semibold",
						children: "Mix intelligente"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Una selezione sul tuo umore"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/explore",
					className: "quick-tile flex items-center gap-3 rounded-lg bg-elevated p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-11 items-center justify-center rounded-lg bg-elevated text-primary",
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
