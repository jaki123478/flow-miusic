import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RADIO_COUNTRIES } from "./types-CuQ6ClJX.mjs";
import { m as stationToTrack } from "./lyrics-DWcjsahh.mjs";
import { D as TrackRow, E as TrackCard, I as useFlowStore, S as HScroll, o as Route$10, w as SectionHeader } from "./router-CInPgx50.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/radio-CGdEIjP6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RadioPage() {
	const { c } = Route$10.useSearch();
	const navigate = Route$10.useNavigate();
	const { top, country } = Route$10.useLoaderData();
	const playQueue = useFlowStore((s) => s.playQueue);
	const code = (c || "IT").toUpperCase();
	const topTracks = (0, import_react.useMemo)(() => top.map(stationToTrack), [top]);
	const countryTracks = (0, import_react.useMemo)(() => country.map(stationToTrack), [country]);
	const countryName = RADIO_COUNTRIES.find((x) => x.code === code)?.name || code;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-7",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Radio dal mondo"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Emittenti live da ogni continente, pronte per iPhone e Android."
			})] }),
			topTracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Più ascoltate",
				action: "Riproduci",
				onAction: () => playQueue(topTracks, 0)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: topTracks.slice(0, 16).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track: t,
				queue: topTracks
			}, t.id)) })] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Per paese" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6",
				children: RADIO_COUNTRIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void navigate({ search: { c: item.code } }),
					className: `chip h-11 shrink-0 rounded-full px-4 text-sm font-medium ${item.code === code ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"}`,
					children: item.name
				}, item.code))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: countryName,
				action: countryTracks.length ? "Riproduci" : void 0,
				onAction: countryTracks.length ? () => playQueue(countryTracks, 0) : void 0
			}), countryTracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Nessuna emittente disponibile al momento."
			}) : countryTracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: countryTracks,
				index: i,
				showIndex: true
			}, t.id))] })
		]
	});
}
//#endregion
export { RadioPage as component };
