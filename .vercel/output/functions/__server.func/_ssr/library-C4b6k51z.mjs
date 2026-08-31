import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { n as createSsrRpc } from "./lyrics-DWcjsahh.mjs";
import { F as Copy, a as Upload, b as Plus, c as Trash2, j as Heart, x as Play } from "../_libs/lucide-react.mjs";
import { A as downloadTracks, B as useCurrentUser, D as TrackRow, G as publishPlaylist, I as useFlowStore, M as removeDownload, N as useCacheStats, O as canDownloadTrack, P as useOfflineDownloads, j as formatBytes, k as clearAllDownloads, w as SectionHeader } from "./router-B7V3nYBz.mjs";
import { n as SignedOut } from "./gates-R39BikH-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-C4b6k51z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var importSpotify = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("ea6a09f743b9ccfc3ea1b144fd1fce5ad9dbc05c4b6411ca82670d5d56620830"));
function csvEscape(value) {
	if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, "\"\"")}"`;
	return value;
}
function tracksToCsv(tracks) {
	return ["title,artist,album,duration,videoId,url", ...tracks.map((t) => [
		csvEscape(t.title),
		csvEscape(t.artist),
		csvEscape(t.album || ""),
		String(Math.round(t.duration || 0)),
		t.videoId || "",
		t.videoId ? `https://www.youtube.com/watch?v=${t.videoId}` : t.streamUrl || ""
	].join(","))].join("\n");
}
function tracksToM3u(tracks, title) {
	const lines = ["#EXTM3U"];
	if (title) lines.push(`#PLAYLIST:${title}`);
	for (const t of tracks) {
		lines.push(`#EXTINF:${Math.round(t.duration || 0)},${t.artist} - ${t.title}`);
		lines.push(t.videoId ? `https://www.youtube.com/watch?v=${t.videoId}` : t.streamUrl || "");
	}
	return lines.join("\n");
}
function downloadText(name, body, mime = "text/plain;charset=utf-8") {
	const a = document.createElement("a");
	const url = URL.createObjectURL(new Blob([body], { type: mime }));
	a.href = url;
	a.download = name;
	a.click();
	window.setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
function slugFile(name) {
	return name.replace(/[^\w\u00C0-\u024f.-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "playlist";
}
function videoIdFromUrl(raw) {
	const text = raw.trim();
	return (text.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/|\/offline-audio\/)([A-Za-z0-9_-]{11})/) || text.match(/^([A-Za-z0-9_-]{11})$/))?.[1];
}
function splitCsvLine(line) {
	const out = [];
	let cur = "";
	let q = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (q) {
			if (ch === "\"" && line[i + 1] === "\"") {
				cur += "\"";
				i += 1;
			} else if (ch === "\"") q = false;
			else cur += ch;
		} else if (ch === "\"") q = true;
		else if (ch === ",") {
			out.push(cur);
			cur = "";
		} else cur += ch;
	}
	out.push(cur);
	return out.map((s) => s.trim());
}
function looksLikeCsv(raw) {
	const first = raw.split(/\r?\n/).find((l) => l.trim()) || "";
	return /title\s*,\s*artist/i.test(first) || first.includes(",") && first.split(",").length >= 2;
}
function parseArtistTitle(rest) {
	const dash = rest.match(/^(.{1,80}?)\s+[-–—]\s+(.+)$/);
	if (dash) return {
		artist: dash[1].trim(),
		title: dash[2].trim()
	};
	return {
		artist: "",
		title: rest.trim()
	};
}
function parseM3u(raw) {
	const title = raw.match(/#PLAYLIST:(.+)/i)?.[1]?.trim() || "Playlist importata";
	const seeds = [];
	const lines = raw.split(/\r?\n/);
	let pending = null;
	for (const line of lines) {
		const t = line.trim();
		if (!t || /^#EXTM3U/i.test(t) || /^#PLAYLIST/i.test(t)) continue;
		const inf = t.match(/#EXTINF:(-?\d+)\s*,\s*(.*)/i);
		if (inf) {
			const parsed = parseArtistTitle(inf[2]);
			pending = {
				duration: Number(inf[1]) > 0 ? Number(inf[1]) : void 0,
				artist: parsed.artist,
				title: parsed.title
			};
			continue;
		}
		if (t.startsWith("#")) continue;
		const videoId = videoIdFromUrl(t);
		if (pending) {
			seeds.push({
				...pending,
				videoId
			});
			pending = null;
		} else seeds.push({
			title: t,
			artist: "",
			videoId
		});
	}
	return {
		title,
		seeds: seeds.slice(0, 200)
	};
}
function parseCsv(raw) {
	const rows = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
	if (!rows.length) return {
		title: "Playlist importata",
		seeds: []
	};
	const header = splitCsvLine(rows[0]).map((h) => h.toLowerCase());
	const hasHeader = header.includes("title") || header.includes("titolo") || header.includes("artist") || header.includes("artista");
	const idx = (names) => header.findIndex((h) => names.includes(h));
	const iTitle = hasHeader ? idx([
		"title",
		"titolo",
		"name",
		"track"
	]) : 0;
	const iArtist = hasHeader ? idx([
		"artist",
		"artista",
		"artists"
	]) : 1;
	const iAlbum = hasHeader ? idx(["album"]) : -1;
	const iDur = hasHeader ? idx([
		"duration",
		"durata",
		"length"
	]) : -1;
	const iVid = hasHeader ? idx([
		"videoid",
		"video_id",
		"id"
	]) : -1;
	const iUrl = hasHeader ? idx([
		"url",
		"link",
		"uri"
	]) : -1;
	const start = hasHeader ? 1 : 0;
	const seeds = [];
	for (const row of rows.slice(start)) {
		const cols = splitCsvLine(row);
		if (!cols.length) continue;
		const url = iUrl >= 0 ? cols[iUrl] || "" : cols.find((c) => /youtu|http/i.test(c)) || "";
		const videoId = (iVid >= 0 ? cols[iVid] : "") || videoIdFromUrl(url);
		let title = iTitle >= 0 ? cols[iTitle] || "" : "";
		let artist = iArtist >= 0 ? cols[iArtist] || "" : "";
		if (!title && cols[0]) {
			const parsed = parseArtistTitle(cols[0]);
			artist = artist || parsed.artist;
			title = parsed.title;
		}
		if (!title) continue;
		const durationRaw = iDur >= 0 ? cols[iDur] : "";
		const duration = durationRaw ? Number(durationRaw) : void 0;
		seeds.push({
			title,
			artist,
			videoId,
			duration: duration && Number.isFinite(duration) ? duration : void 0,
			album: iAlbum >= 0 ? cols[iAlbum] : void 0
		});
	}
	return {
		title: "Playlist importata",
		seeds: seeds.slice(0, 200)
	};
}
function parseLines(raw) {
	return {
		title: "Lista importata",
		seeds: raw.split(/\r?\n/).map((line) => line.replace(/^\d+[\).\s-]+/, "").trim()).filter((line) => line.length > 1 && !line.startsWith("#")).map((line) => {
			const videoId = videoIdFromUrl(line);
			if (videoId) return {
				title: videoId,
				artist: "",
				videoId
			};
			const parsed = parseArtistTitle(line);
			return {
				title: parsed.title,
				artist: parsed.artist
			};
		}).slice(0, 200)
	};
}
function parsePlaylistFile(raw, filename = "") {
	const lower = filename.toLowerCase();
	if (lower.endsWith(".csv") || looksLikeCsv(raw)) return parseCsv(raw);
	if (/#EXTM3U/i.test(raw) || lower.endsWith(".m3u") || lower.endsWith(".m3u8")) return parseM3u(raw);
	return parseLines(raw);
}
function seedsToTracks(seeds) {
	const tracks = [];
	const unresolved = [];
	const seen = /* @__PURE__ */ new Set();
	for (const s of seeds) if (s.videoId && /^[\w-]{11}$/.test(s.videoId)) {
		if (seen.has(s.videoId)) continue;
		seen.add(s.videoId);
		tracks.push({
			id: s.videoId,
			title: s.title || s.videoId,
			artist: s.artist || "Artista",
			album: s.album,
			artwork: `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg`,
			duration: s.duration || 0,
			streamUrl: `/api/stream?v=${s.videoId}`,
			source: "ytmusic",
			videoId: s.videoId
		});
	} else if (s.title) unresolved.push(s);
	return {
		tracks,
		unresolved
	};
}
function unresolvedToText(seeds) {
	return seeds.map((s) => s.artist ? `${s.artist} - ${s.title}` : s.title).filter(Boolean).join("\n");
}
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
	const downloads = useOfflineDownloads();
	const cache = useCacheStats();
	const notify = useFlowStore((s) => s.notify);
	const [tab, setTab] = (0, import_react.useState)("liked");
	const [title, setTitle] = (0, import_react.useState)("");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [spotUrl, setSpotUrl] = (0, import_react.useState)("");
	const [importing, setImporting] = (0, import_react.useState)(false);
	const [importMsg, setImportMsg] = (0, import_react.useState)(null);
	const [dlBusy, setDlBusy] = (0, import_react.useState)("");
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
		},
		{
			id: "downloads",
			label: "Scaricati",
			count: downloads.length
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => playQueue(liked, 0),
								className: "play-fab flex size-14 items-center justify-center rounded-full bg-primary text-primary-fg",
								"aria-label": "Riproduci",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 size-6 fill-current" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: Boolean(dlBusy) || !liked.some(canDownloadTrack),
								onClick: () => {
									setDlBusy("liked");
									downloadTracks(liked, () => {}).then((r) => notify(r.fail ? `Salvati ${r.ok + r.skipped}, ${r.fail} errori` : `${r.ok + r.skipped} brani in cache`)).finally(() => setDlBusy(""));
								},
								className: "h-11 rounded-full bg-elevated px-4 text-sm font-medium disabled:opacity-50",
								children: dlBusy === "liked" ? "Scarico…" : "Scarica playlist"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => downloadText("preferiti.csv", tracksToCsv(liked), "text/csv;charset=utf-8"),
								className: "h-11 rounded-full bg-elevated px-4 text-sm font-medium",
								children: "Esporta CSV"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => downloadText("preferiti.m3u", tracksToM3u(liked, "Preferiti")),
								className: "h-11 rounded-full bg-elevated px-4 text-sm font-medium",
								children: "Esporta M3U"
							})
						]
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
			tab === "downloads" ? downloads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheBanner, {
				stats: cache,
				empty: true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Nessun brano salvato offline. Dal menu di una traccia scegli Scarica offline." })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CacheBanner, {
					stats: cache,
					onClear: () => {
						if (!window.confirm("Vuoi svuotare la cache offline? I brani in Scaricati verranno rimossi.")) return;
						clearAllDownloads().then(() => notify("Cache svuotata"));
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Scaricati",
					action: "Riproduci",
					onAction: () => playQueue(downloads, 0)
				}),
				downloads.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
							track: t,
							queue: downloads,
							index: i
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							if (!t.videoId) return;
							removeDownload(t.videoId).then(() => notify("Download rimosso"));
						},
						className: "flex size-11 shrink-0 items-center justify-center text-subtle",
						"aria-label": "Rimuovi download",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
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
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-1 inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-elevated px-3 text-xs font-medium",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-3.5" }),
									"File M3U / CSV",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: ".m3u,.m3u8,.csv,.txt,text/csv,audio/x-mpegurl",
										className: "hidden",
										onChange: (e) => {
											const file = e.target.files?.[0];
											e.currentTarget.value = "";
											if (!file) return;
											setImporting(true);
											setImportMsg(null);
											file.text().then(async (raw) => {
												const parsed = parsePlaylistFile(raw, file.name);
												const { tracks, unresolved } = seedsToTracks(parsed.seeds);
												let extra = [];
												if (unresolved.length) {
													const res = await importSpotify({ data: { url: unresolvedToText(unresolved) } });
													extra = res.tracks;
													if (res.error && !tracks.length && !extra.length) {
														setImportMsg(res.error);
														return;
													}
												}
												const seen = /* @__PURE__ */ new Set();
												const all = [...tracks, ...extra].filter((t) => {
													if (seen.has(t.id)) return false;
													seen.add(t.id);
													return true;
												});
												if (!all.length) {
													setImportMsg("Nessun brano nel file.");
													return;
												}
												const name = parsed.title && parsed.title !== "Playlist importata" ? parsed.title : file.name.replace(/\.[^.]+$/, "");
												const id = createPlaylistWithTracks(name, all);
												setImportMsg(`Importate ${all.length} tracce da file`);
												if (id) setOpenId(id);
											}).catch(() => setImportMsg("File non letto")).finally(() => setImporting(false));
										}
									})
								]
							})
						]
					}),
					playlists.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								downloadText("libreria-flow.csv", tracksToCsv(playlists.flatMap((pl) => pl.trackIds.map((id) => trackMap[id]).filter(Boolean))), "text/csv;charset=utf-8");
							},
							className: "h-9 rounded-full bg-elevated px-3 text-xs font-medium",
							children: "Esporta libreria CSV"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								downloadText("libreria-flow.m3u", playlists.map((pl) => {
									return tracksToM3u(pl.trackIds.map((id) => trackMap[id]).filter(Boolean), pl.title);
								}).join("\n\n"));
							},
							className: "h-9 rounded-full bg-elevated px-3 text-xs font-medium",
							children: "Esporta libreria M3U"
						})]
					}) : null,
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
function CacheBanner({ stats, onClear, empty }) {
	const quota = stats.quota ? formatBytes(stats.quota) : null;
	const used = stats.bytes ? formatBytes(stats.bytes) : formatBytes(stats.usage || 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface px-4 py-3 text-sm ring-1 ring-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: empty ? "Cache vuota. I brani scaricati restano nella scheda Scaricati." : `${stats.count} brani · ${used}${quota ? ` su ${quota} disponibili` : ""}`
		}), onClear && stats.count ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onClear,
			className: "h-8 rounded-full bg-elevated px-3 text-xs font-medium",
			children: "Svuota cache"
		}) : null]
	});
}
function DownloadPlaylistBtn({ tracks }) {
	const notify = useFlowStore((s) => s.notify);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [prog, setProg] = (0, import_react.useState)("");
	const n = tracks.filter(canDownloadTrack).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		disabled: busy || n === 0,
		onClick: () => {
			setBusy(true);
			setProg("");
			downloadTracks(tracks, (done, total) => setProg(`${done}/${total}`)).then((r) => notify(r.fail ? `Salvati ${r.ok + r.skipped}, ${r.fail} errori` : `${r.ok + r.skipped} brani in cache`)).finally(() => {
				setBusy(false);
				setProg("");
			});
		},
		className: "h-9 rounded-full bg-primary px-3 text-xs font-bold text-primary-fg disabled:opacity-50",
		children: busy ? prog || "Scarico…" : "Scarica playlist"
	});
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadPlaylistBtn, { tracks }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => downloadText(`${slugFile(pl.title)}.m3u`, tracksToM3u(tracks, pl.title)),
				className: "h-9 rounded-full bg-elevated px-3 text-xs font-medium",
				children: "Esporta M3U"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => downloadText(`${slugFile(pl.title)}.csv`, tracksToCsv(tracks), "text/csv;charset=utf-8"),
				className: "h-9 rounded-full bg-elevated px-3 text-xs font-medium",
				children: "Esporta CSV"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => downloadText(`${slugFile(pl.title)}.json`, JSON.stringify(tracks, null, 2), "application/json"),
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
