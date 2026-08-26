import { i as __toESM } from "../_runtime.mjs";
import { V as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as Plus, o as Trash2 } from "../_libs/lucide-react.mjs";
import { m as useFlowStore, p as TrackRow, u as SectionHeader } from "./router-CHLvWwov.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-DQ7lkyGT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LibraryPage() {
	const liked = useFlowStore((s) => s.liked);
	const recents = useFlowStore((s) => s.recents);
	const playlists = useFlowStore((s) => s.playlists);
	const trackMap = useFlowStore((s) => s.trackMap);
	const playQueue = useFlowStore((s) => s.playQueue);
	const createPlaylist = useFlowStore((s) => s.createPlaylist);
	const removePlaylist = useFlowStore((s) => s.removePlaylist);
	const [tab, setTab] = (0, import_react.useState)("liked");
	const [title, setTitle] = (0, import_react.useState)("");
	const [openId, setOpenId] = (0, import_react.useState)(null);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "La tua libreria"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Salvata su questo dispositivo."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: [
					{
						id: "liked",
						label: "Preferiti"
					},
					{
						id: "recents",
						label: "Recenti"
					},
					{
						id: "playlists",
						label: "Playlist"
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setTab(t.id);
						setOpenId(null);
					},
					className: `h-10 rounded-full px-4 text-sm font-medium ${tab === t.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"}`,
					children: t.label
				}, t.id))
			}),
			tab === "liked" ? liked.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "I brani che ami compariranno qui." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: `${liked.length} brani`,
				action: "Riproduci",
				onAction: () => playQueue(liked, 0)
			}), liked.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: liked,
				index: i,
				showIndex: true
			}, t.id))] }) : null,
			tab === "recents" ? recents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "La cronologia di ascolto è vuota." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Ascoltati di recente",
				action: "Riproduci",
				onAction: () => playQueue(recents, 0)
			}), recents.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: recents,
				index: i
			}, t.id))] }) : null,
			tab === "playlists" && !openId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
						className: "h-12 min-w-0 flex-1 rounded-xl bg-surface px-4 text-sm ring-1 ring-border outline-none placeholder:text-subtle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "flex size-12 items-center justify-center rounded-xl bg-primary text-primary-fg",
						"aria-label": "Crea playlist",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
					})]
				}), playlists.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Crea una playlist e aggiungi brani dal player." }) : playlists.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-xl bg-surface px-3 py-2 ring-1 ring-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpenId(p.id),
						className: "min-w-0 flex-1 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium",
							children: p.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [p.trackIds.length, " brani"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => removePlaylist(p.id),
						className: "flex size-11 items-center justify-center text-subtle",
						"aria-label": "Elimina playlist",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}, p.id))]
			}) : null,
			tab === "playlists" && openId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setOpenId(null),
				className: "mb-3 text-sm text-primary",
				children: "Torna alle playlist"
			}), openTracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { text: "Playlist vuota. Aggiungi brani dai risultati di ricerca." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Playlist",
				action: "Riproduci",
				onAction: () => playQueue(openTracks, 0)
			}), openTracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: openTracks,
				index: i,
				showIndex: true
			}, t.id))] })] }) : null
		]
	});
}
function Empty({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-2xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border",
		children: text
	});
}
//#endregion
export { LibraryPage as component };
