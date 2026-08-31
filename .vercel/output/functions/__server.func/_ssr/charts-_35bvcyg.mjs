import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as CHARTS } from "./types-CuQ6ClJX.mjs";
import { P as TrackRow, U as useFlowStore, j as SectionHeader, u as Route$18 } from "./router-c_BOUjD0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/charts-_35bvcyg.js
var import_jsx_runtime = require_jsx_runtime();
function ChartsPage() {
	const { id = "global" } = Route$18.useSearch();
	const navigate = Route$18.useNavigate();
	const chart = CHARTS.find((c) => c.id === id) || CHARTS[0];
	const tracks = Route$18.useLoaderData();
	const playQueue = useFlowStore((s) => s.playQueue);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Classifiche"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Le hit del momento, aggiornate in tempo reale."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6",
				children: CHARTS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void navigate({ search: { id: c.id } }),
					className: `chip h-11 shrink-0 rounded-full px-4 text-sm font-medium ${c.id === chart.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"}`,
					children: c.title
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: chart.title,
				action: tracks.length ? "Riproduci" : void 0,
				onAction: tracks.length ? () => playQueue(tracks, 0) : void 0
			}), tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Classifica non disponibile al momento."
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
export { ChartsPage as component };
