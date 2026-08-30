import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as createSsrRpc } from "./catalog-CGOj_o-p.mjs";
import { A as Copy, O as Heart, b as Play, s as Trash2, y as Plus } from "../_libs/lucide-react.mjs";
import { C as TrackRow, M as publishPlaylist, N as useCurrentUser, T as useFlowStore, b as SectionHeader } from "./router-2cWS5y1K.mjs";
import { n as SignedOut } from "./gates-D1iVAyXB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-U0gXeYhp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var importSpotify = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("ea6a09f743b9ccfc3ea1b144fd1fce5ad9dbc05c4b6411ca82670d5d56620830"));
function LibraryPage() {
	const liked = useFlowStore((s) => s.liked);
	const recents = useFlowStore((s) => s.recents);
	const playlists = useFlowStore((s) => s.playlists);
	const trackMap = useFlowStore((s) => s.trackMap);
	const playQueue = useFlowStore((s) => s.playQueue);
	const createPlaylist = useFlowStore((s) => s.createPlaylist);
	const createPlaylistWithTracks = useFlowStore((s) => s.createPlaylistWithTracks);
	const removePlaylist = useFlowStore((s) => s.removePlaylist);
	const renamePlaylist = useFlowStore((s) => s.renamePlaylist);
	const duplicatePlaylist = useFlowStore((s) => s.duplicatePlaylist);
	const setPlaylistFolder = useFlowStore((s) => s.setPlaylistFolder);
	const setPlaylistPublic = useFlowStore((s) => s.setPlaylistPublic);
	const clearRecents = useFlowStore((s) => s.clearRecents);
	const user = useCurrentUser();
	const [tab, setTab] = (0, import_react.useState)("liked");
	const [title, setTitle] = (0, import_react.useState)("");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [spotUrl, setSpotUrl] = (0, import_react.useState)("");
	const [importing, setImporting] = (0, import_react.useState)(false);
	const [importMsg, setImportMsg] = (0, import_react.useState)(null);
	const openTracks = (0, import_react.useMemo)(() => {
		if (!openId) return [];
		const pl = playlists.find((p) => p.id === openId);
		if (!pl) return [];
		return pl.trackIds.map((id) => trackMap[id]).filter(Boolean);
	}, [
		openId,
		playlists,
		trackMap
	]);
	const tabs = [
		{
			id: "liked",
			label: "Preferiti",
			count: liked.length
		},
		{
			id: "recents",
			label: "Recenti",
			count: recents.length
		},
		{
			id: "playlists",
			label: "Playlist",
			count: playlists.length
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: "La tua libreria"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/stats",
							className: "text-muted hover:text-fg",
							children: "Stats"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/friends",
							className: "text-muted hover:text-fg",
							children: "Amici"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/fresh",
							className: "text-muted hover:text-fg",
							children: "Novità"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							search: { mode: "up" },
							className: "font-semibold text-primary",
							children: "Registrati"
						}),
						" ",
						"per salvare playlist e preferiti sul tuo account."
					]
				}) })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setTab(t.id);
						setOpenId(null);
					},
					className: `chip h-10 rounded-full px-4 text-sm font-medium ${tab === t.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"}`,
					children: [t.label, t.count ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1.5 text-xs opacity-70",
						children: t.count
					}) : null]
				}, t.id))
			}),
			tab === "liked" ? liked.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "I brani che ami compariranno qui. Tocca il cuore su un brano." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6 sm:flex-row sm:items-end",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "liked-wash flex size-40 shrink-0 items-center justify-center rounded shadow-2xl sm:size-48",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-16 fill-current text-fg" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase",
						children: "Playlist"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-heading text-3xl font-bold tracking-tight sm:text-5xl",
						children: "Brani che ti piacciono"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [liked.length, " brani"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => playQueue(liked, 0),
						className: "play-fab mt-4 flex size-14 items-center justify-center rounded-full bg-primary text-primary-fg",
						"aria-label": "Riproduci",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-6 fill-current" })
					})
				] })]
			}), liked.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: liked,
				index: i,
				showIndex: true
			}, t.id))] }) : null,
			tab === "recents" ? recents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "La cronologia di ascolto è vuota." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Ascoltati di recente",
					action: "Cancella",
					onAction: clearRecents
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => playQueue(recents, 0),
					className: "mb-3 h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg",
					children: "Riproduci"
				}),
				recents.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
					track: t,
					queue: recents,
					index: i
				}, t.id))
			] }) : null,
			tab === "playlists" && !openId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							createPlaylist(title);
							setTitle("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: title,
							onChange: (e) => setTitle(e.target.value),
							placeholder: "Nuova playlist",
							className: "h-12 min-w-0 flex-1 rounded-lg bg-surface px-4 text-base ring-1 ring-border outline-none placeholder:text-subtle"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "flex size-12 items-center justify-center rounded-lg bg-primary text-primary-fg",
							"aria-label": "Crea playlist",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-2 rounded-lg bg-surface p-3 ring-1 ring-border",
						onSubmit: (e) => {
							e.preventDefault();
							if (!spotUrl.trim() || importing) return;
							setImporting(true);
							setImportMsg(null);
							importSpotify({ data: { url: spotUrl } }).then((res) => {
								if (res.error || !res.tracks.length) {
									setImportMsg(res.error || "Nessun brano importato");
									return;
								}
								const id = createPlaylistWithTracks(res.title, res.tracks);
								setSpotUrl("");
								setImportMsg(res.missing ? `Importate ${res.tracks.length} tracce (${res.missing} non trovate)` : `Importate ${res.tracks.length} tracce`);
								if (id) setOpenId(id);
							}).catch(() => setImportMsg("Import non riuscito")).finally(() => setImporting(false));
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Importa playlist"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Link Spotify, YouTube, Apple Music, oppure una lista «Artista – Titolo» (anche CSV)."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: spotUrl,
									onChange: (e) => setSpotUrl(e.target.value),
									placeholder: "https://open.spotify.com/playlist/…  o  https://youtube.com/playlist?list=",
									className: "h-11 min-w-0 flex-1 rounded-lg bg-elevated px-3 text-sm outline-none ring-1 ring-border"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: importing,
									className: "h-11 rounded-full bg-fg px-4 text-sm font-bold text-bg disabled:opacity-60",
									children: importing ? "Importo…" : "Importa"
								})]
							}),
							importMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: importMsg
							}) : null
						]
					}),
					playlists.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Crea una playlist e aggiungi brani dal menu di ogni traccia." }) : playlists.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-lg bg-surface px-3 py-2 ring-1 ring-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setOpenId(p.id),
								className: "min-w-0 flex-1 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: p.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										p.trackIds.length,
										" brani",
										p.folder ? ` · ${p.folder}` : "",
										p.publicId ? " · pubblica" : ""
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									const tracks = p.trackIds.map((id) => trackMap[id]).filter(Boolean);
									if (tracks.length) playQueue(tracks, 0);
								},
								className: "rounded-full px-3 py-2 text-xs font-medium text-muted",
								children: "Play"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => duplicatePlaylist(p.id),
								className: "flex size-11 items-center justify-center text-subtle",
								"aria-label": "Duplica",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									const next = window.prompt("Nome playlist", p.title);
									if (next) renamePlaylist(p.id, next);
								},
								className: "rounded-full px-2 py-2 text-xs font-medium text-muted",
								children: "Rinomina"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => removePlaylist(p.id),
								className: "flex size-11 items-center justify-center text-subtle",
								"aria-label": "Elimina playlist",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, p.id))
				]
			}) : null,
			tab === "playlists" && openId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setOpenId(null),
					className: "mb-3 text-sm text-muted hover:text-fg",
					children: "Torna alle playlist"
				}),
				openId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaylistTools, {
					id: openId,
					tracks: openTracks,
					userName: user?.displayName ?? user?.primaryEmail ?? "Utente",
					signedIn: Boolean(user),
					setPlaylistFolder,
					setPlaylistPublic
				}) : null,
				openTracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Playlist vuota. Aggiungi brani dal menu di una traccia." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Playlist",
					action: "Riproduci",
					onAction: () => playQueue(openTracks, 0)
				}), openTracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
					track: t,
					queue: openTracks,
					index: i,
					showIndex: true
				}, t.id))] })
			] }) : null
		]
	});
}
function Empty({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border",
		children: text
	});
}
function download(name, body) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
	a.download = name;
	a.click();
}
function PlaylistTools({ id, tracks, userName, signedIn, setPlaylistFolder, setPlaylistPublic }) {
	const pl = useFlowStore((s) => s.playlists.find((p) => p.id === id));
	const notify = useFlowStore((s) => s.notify);
	if (!pl) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 flex flex-wrap gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					setPlaylistFolder(id, window.prompt("Cartella", pl.folder || "") || "");
				},
				className: "h-9 rounded-full bg-elevated px-3 text-xs font-medium",
				children: "Cartella"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					const m3u = ["#EXTM3U", ...tracks.map((t) => `#EXTINF:${t.duration},${t.artist} - ${t.title}\nhttps://www.youtube.com/watch?v=${t.videoId || t.id}`)].join("\n");
					download(`${pl.title}.m3u`, m3u);
				},
				className: "h-9 rounded-full bg-elevated px-3 text-xs font-medium",
				children: "Esporta M3U"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => download(`${pl.title}.json`, JSON.stringify(tracks, null, 2)),
				className: "h-9 rounded-full bg-elevated px-3 text-xs font-medium",
				children: "Esporta JSON"
			}),
			signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => {
					const collab = window.confirm("Vuoi renderla anche collaborativa (chi ha il link può aggiungere brani)?");
					publishPlaylist({ data: {
						title: pl.title,
						tracks,
						collab,
						ownerName: userName,
						id: pl.publicId
					} }).then((res) => {
						setPlaylistPublic(id, res.id, collab);
						const url = `${window.location.origin}/p/${res.id}`;
						navigator.clipboard?.writeText(url);
						notify("Playlist pubblica — link copiato");
					});
				},
				className: "h-9 rounded-full bg-primary px-3 text-xs font-bold text-primary-fg",
				children: pl.publicId ? "Aggiorna pubblica" : "Rendi pubblica"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				search: { mode: "up" },
				className: "h-9 rounded-full bg-elevated px-3 text-xs font-medium leading-9",
				children: "Accedi per pubblicare"
			}),
			pl.publicId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/p/$id",
				params: { id: pl.publicId },
				className: "h-9 rounded-full px-3 text-xs font-medium leading-9 text-primary",
				children: "Apri link"
			}) : null
		]
	});
}
//#endregion
export { LibraryPage as component };
