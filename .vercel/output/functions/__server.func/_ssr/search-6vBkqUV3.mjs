import { i as __toESM } from "../_runtime.mjs";
import { V as require_react, v as Link, x as require_jsx_runtime, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as GENRES } from "./types-CuQ6ClJX.mjs";
import { b as LoaderCircle, d as Search, t as X, v as Mic } from "../_libs/lucide-react.mjs";
import { _ as searchCatalog, c as HScroll, f as TrackCard, n as Route$1, p as TrackRow, u as SectionHeader, v as stationToTrack } from "./router-CHLvWwov.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-6vBkqUV3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const { q: initial = "" } = Route$1.useSearch();
	const navigate = useNavigate({ from: "/search" });
	const [q, setQ] = (0, import_react.useState)(initial);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [independent, setIndependent] = (0, import_react.useState)([]);
	const [radios, setRadios] = (0, import_react.useState)([]);
	const [recent, setRecent] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem("flow_recent_searches");
			if (raw) setRecent(JSON.parse(raw));
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		setQ(initial);
	}, [initial]);
	(0, import_react.useEffect)(() => {
		const term = q.trim();
		if (!term) {
			setTracks([]);
			setIndependent([]);
			setRadios([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		const t = window.setTimeout(() => {
			searchCatalog({ data: { q: term } }).then((res) => {
				setTracks(res.tracks);
				setIndependent(res.independent);
				setRadios(res.radios);
				const next = [term, ...recent.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 8);
				setRecent(next);
				try {
					localStorage.setItem("flow_recent_searches", JSON.stringify(next));
				} catch {}
			}).finally(() => setLoading(false));
		}, 320);
		return () => window.clearTimeout(t);
	}, [q]);
	const radioTracks = (0, import_react.useMemo)(() => radios.map(stationToTrack), [radios]);
	const empty = !loading && q.trim() && tracks.length + independent.length + radios.length === 0;
	const voiceSearch = () => {
		const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SR) return;
		const rec = new SR();
		rec.lang = "it-IT";
		rec.onresult = (ev) => {
			const text = ev.results?.[0]?.[0]?.transcript;
			if (text) {
				setQ(text);
				navigate({ search: { q: text } });
			}
		};
		rec.start();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Cerca"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-12 items-center gap-2 rounded-xl bg-surface px-3 ring-1 ring-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5 text-subtle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => {
							setQ(e.target.value);
							navigate({
								search: { q: e.target.value || void 0 },
								replace: true
							});
						},
						placeholder: "Brani, artisti, radio...",
						className: "h-full min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-subtle",
						autoCapitalize: "off",
						autoCorrect: "off",
						enterKeyHint: "search"
					}),
					q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setQ("");
							navigate({ search: { q: void 0 } });
						},
						className: "flex size-9 items-center justify-center text-muted",
						"aria-label": "Pulisci",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: voiceSearch,
						className: "flex size-9 items-center justify-center text-muted",
						"aria-label": "Ricerca vocale",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" })
					})
				]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Ricerca in corso"]
			}) : null,
			!q.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [recent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
				title: "Ricerche recenti",
				action: "Cancella",
				onAction: () => {
					setRecent([]);
					localStorage.removeItem("flow_recent_searches");
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: recent.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setQ(s);
						navigate({ search: { q: s } });
					},
					className: "rounded-full bg-elevated px-3 py-2 text-sm text-fg",
					children: s
				}, s))
			})] }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Sfoglia generi" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: GENRES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					search: { genre: g.id },
					className: "flex h-16 items-end rounded-xl bg-elevated p-3 text-sm font-semibold ring-1 ring-border",
					children: g.name
				}, g.id))
			})] })] }) : null,
			empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Nessun risultato per “",
					q,
					"”."
				]
			}) : null,
			tracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "YouTube Music" }), tracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: tracks,
				index: i
			}, t.id))] }) : null,
			independent.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Altri video" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HScroll, { children: independent.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackCard, {
				track: t,
				queue: independent
			}, t.id)) })] }) : null,
			radioTracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Radio" }), radioTracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: radioTracks,
				index: i
			}, t.id))] }) : null
		]
	});
}
//#endregion
export { SearchPage as component };
