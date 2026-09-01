import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as MOODS, r as GENRES } from "./types-CuQ6ClJX.mjs";
import { D as Radio, N as Music2, c as Trophy, f as Sparkles } from "../_libs/lucide-react.mjs";
import { K as hashHue, P as TrackRow, U as useFlowStore, j as SectionHeader, l as Route$16 } from "./router-BKwaTMc9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-dQvwFc0P.js
var import_jsx_runtime = require_jsx_runtime();
function ExplorePage() {
	const { genre } = Route$16.useSearch();
	const selected = GENRES.find((g) => g.id === genre) || GENRES[0];
	const tracks = Route$16.useLoaderData();
	const playQueue = useFlowStore((s) => s.playQueue);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-8 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-extrabold tracking-tight",
					children: "Esplora & Mood"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Scopri nuove vibrazioni, generi e classifiche da tutto il mondo."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/charts",
						className: "pressable flex items-center gap-2 rounded-full bg-elevated px-4 py-2 text-xs font-semibold text-fg ring-1 ring-border hover:bg-highlight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-4 text-amber-400" }), "Classifiche"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/radio",
						className: "pressable flex items-center gap-2 rounded-full bg-elevated px-4 py-2 text-xs font-semibold text-fg ring-1 ring-border hover:bg-highlight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-4 text-emerald-400" }), "Radio Live"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Mood & Atmosfere" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2.5",
				children: MOODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/mix",
					search: { mood: m.id },
					className: "chip pressable flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-xs font-semibold ring-1 ring-border hover:border-primary/50 hover:bg-elevated hover:text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 text-primary" }), m.label]
				}, m.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Tutti i Generi Musicali" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
				children: GENRES.map((g) => {
					const isCurrent = g.id === selected.id;
					const hue = hashHue(g.name);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/explore",
						search: { genre: g.id },
						style: { background: `linear-gradient(135deg, hsl(${hue} 60% 22%), hsl(${hue} 70% 12%))` },
						className: `group relative flex h-24 flex-col justify-between overflow-hidden rounded-2xl p-3.5 transition-all hover:scale-[1.03] hover:shadow-lg ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-bg shadow-lg shadow-primary/20" : "ring-1 ring-white/10"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-heading text-sm font-bold text-fg drop-shadow",
								children: g.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4 text-white/50 transition-transform group-hover:scale-110 group-hover:text-white" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-medium text-white/70",
							children: "Esplora tracce"
						})]
					}, g.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border/60 bg-surface/40 p-4 sm:p-6 backdrop-blur-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: `Brani in evidenza: ${selected.name}`,
					action: tracks.length ? "Riproduci Tutto" : void 0,
					onAction: tracks.length ? () => playQueue(tracks, 0) : void 0
				}), tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-muted",
					children: "Caricamento tracce in corso..."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 space-y-1",
					children: tracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
						track: t,
						queue: tracks,
						index: i,
						showIndex: true
					}, t.id))
				})]
			})
		]
	});
}
//#endregion
export { ExplorePage as component };
