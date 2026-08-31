import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as MOODS, r as GENRES } from "./types-CuQ6ClJX.mjs";
import { a as getDiscoverMix, h as stationToTrack } from "./lyrics-BNyLFdmy.mjs";
import { D as Play, f as Sparkles, k as Pause, q as Compass } from "../_libs/lucide-react.mjs";
import { A as QuickTile, G as greetingIt, K as hashHue, M as TrackArt, N as TrackCard, O as CollectionCard, P as TrackRow, U as useFlowStore, W as cn, d as Route$19, j as SectionHeader, k as HScroll, q as useCurrentUser } from "./router-c_BOUjD0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B0hbg5HN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const feed = Route$19.useLoaderData();
	const { trending, hitsMix, independent, radios } = feed;
	const discoverWeekly = feed.discoverWeekly || [];
	const curated = feed.curated || [];
	const dailyPlaylists = feed.dailyPlaylists || [];
	const user = useCurrentUser();
	const [hello, setHello] = (0, import_react.useState)("Ciao");
	(0, import_react.useEffect)(() => {
		const greet = greetingIt();
		const first = (user?.displayName || "").trim().split(/\s+/)[0];
		setHello(first && !user?.isDevFallback ? `${greet}, ${first}` : greet);
	}, [user?.displayName, user?.isDevFallback]);
	const recents = useFlowStore((s) => s.recents);
	const liked = useFlowStore((s) => s.liked);
	const followed = useFlowStore((s) => s.followedArtists);
	const [weekly, setWeekly] = (0, import_react.useState)(discoverWeekly);
	const [weeklyPersonal, setWeeklyPersonal] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const artists = [
			...followed,
			...liked.map((t) => t.artist),
			...recents.map((t) => t.artist)
		].map((a) => a.trim()).filter((a, i, arr) => a && arr.indexOf(a) === i).slice(0, 6);
		if (!artists.length) {
			setWeekly(discoverWeekly);
			setWeeklyPersonal(false);
			return;
		}
		let cancelled = false;
		getDiscoverMix({ data: { artists } }).then((tracks) => {
			if (cancelled || !tracks.length) return;
			setWeekly(tracks);
			setWeeklyPersonal(true);
		}).catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [
		discoverWeekly,
		followed,
		liked,
		recents
	]);
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
					className: "mt-4 flex gap-2 overflow-x-auto scrollbar-none pb-1",
					children: [
						["all", "Tutto"],
						["music", "Musica"],
						["playlists", "Playlist"],
						["radio", "Radio"]
					].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFilter(id),
						className: cn("chip h-8 rounded-full px-4 text-sm font-medium", filter === id ? "bg-[#D4E84B] text-[#111827]" : "bg-elevated/90 text-fg"),
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
			filter !== "radio" && weekly.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Scoperta della settimana",
					action: "Riproduci",
					onAction: () => playQueue(weekly, 0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs text-muted",
					children: weeklyPersonal ? "Mix personalizzato dai tuoi ascolti e artisti seguiti." : "Selezione reale dal catalogo YouTube Music, non una playlist inventata."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: weekly.slice(0, 12).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
					track: t,
					queue: weekly
				}, t.id)) })
			] }) : null,
			filter !== "radio" && curated.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "In evidenza" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: curated.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => col.tracks.length && playQueue(col.tracks, 0),
				className: "relative h-44 w-[min(86vw,20rem)] shrink-0 overflow-hidden rounded-[1.6rem] text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: col.tracks[0]?.artwork,
						alt: "",
						referrerPolicy: "no-referrer",
						className: "absolute inset-0 size-full object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "relative flex h-full flex-col justify-between p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-lg font-bold tracking-tight",
							children: col.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-xs text-white/75",
							children: col.subtitle
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-10 items-center justify-center rounded-full bg-[#D4E84B] text-[#111827]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
						})]
					})
				]
			}, col.id)) })] }) : null,
			filter !== "music" && filter !== "radio" && dailyPlaylists.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Playlist del giorno",
				action: "Classifiche",
				onAction: () => void navigate({ to: "/charts" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-1",
				children: dailyPlaylists.map((col) => {
					const cover = col.tracks[0];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 rounded-xl px-1 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => col.tracks.length && playQueue(col.tracks, 0),
							className: "flex min-w-0 flex-1 items-center gap-3 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-14 shrink-0 overflow-hidden rounded-xl bg-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackArt, {
									src: cover?.artwork,
									alt: ""
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate text-sm font-bold",
									children: col.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate text-xs text-muted",
									children: [
										col.subtitle,
										" · ",
										col.tracks.length,
										" brani"
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => col.tracks.length && playQueue(col.tracks, 0),
							className: "flex size-9 items-center justify-center rounded-full bg-elevated",
							"aria-label": `Riproduci ${col.title}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-4 fill-current" })
						})]
					}, col.id);
				})
			})] }) : null,
			filter !== "radio" && filter !== "playlists" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Fatto per te" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HScroll, { children: [
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
			filter !== "radio" && filter !== "playlists" && hero ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
			filter !== "radio" && filter !== "playlists" && daily.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
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
			filter !== "radio" && filter !== "playlists" && trending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Tendenze del momento",
				action: "Riproduci",
				onAction: () => playQueue(trending, 0)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: trending.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track: t,
				queue: trending
			}, t.id)) })] }) : null,
			filter !== "radio" && filter !== "playlists" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Mood" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
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
			filter !== "radio" && filter !== "playlists" && hitsMix.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
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
			filter !== "radio" && filter !== "playlists" && independent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Nuove uscite" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: independent.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
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
