import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as MOODS, r as GENRES } from "./types-CuQ6ClJX.mjs";
import { P as TrackRow, U as useFlowStore, j as SectionHeader, l as Route$16 } from "./router-CiV8_qBv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-CJYBXVAC.js
var import_jsx_runtime = require_jsx_runtime();
function ExplorePage() {
	const { genre } = Route$16.useSearch();
	const selected = GENRES.find((g) => g.id === genre) || GENRES[0];
	const tracks = Route$16.useLoaderData();
	const playQueue = useFlowStore((s) => s.playQueue);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Esplora"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Generi, mood e scene da tutto il mondo."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Mood" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: MOODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/mix",
					search: { mood: m.id },
					className: "chip rounded-full bg-elevated px-4 py-2 text-sm font-medium ring-1 ring-border",
					children: m.label
				}, m.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6",
				children: GENRES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					search: { genre: g.id },
					className: `chip shrink-0 rounded-full px-4 py-2 text-sm font-medium ${g.id === selected.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"}`,
					children: g.name
				}, g.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: selected.name,
				action: tracks.length ? "Riproduci" : void 0,
				onAction: tracks.length ? () => playQueue(tracks, 0) : void 0
			}), tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nessun brano per questo genere al momento."
			}) : tracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: tracks,
				index: i,
				showIndex: true
			}, t.id))] })
		]
	});
}
//#endregion
export { ExplorePage as component };
