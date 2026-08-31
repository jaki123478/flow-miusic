import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as GENRES } from "./types-CuQ6ClJX.mjs";
import { m as stationToTrack, p as searchCatalog } from "./lyrics-DWcjsahh.mjs";
import { E as LoaderCircle, g as Search, t as X, w as Mic } from "../_libs/lucide-react.mjs";
import { D as TrackRow, E as TrackCard, S as HScroll, a as Route$9, w as SectionHeader, z as hashHue } from "./router-3XRz9yob.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-CjkcD_9M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const { q: initial = "" } = Route$9.useSearch();
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
				className: "text-3xl font-bold tracking-tight",
				children: "Cerca"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-12 items-center gap-3 rounded-full bg-fg px-4 text-bg md:max-w-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (e) => {
							setQ(e.target.value);
							navigate({
								search: { q: e.target.value || void 0 },
								replace: true
							});
						},
						placeholder: "Cosa vuoi ascoltare?",
						className: "h-full min-w-0 flex-1 bg-transparent text-base font-medium text-bg outline-none placeholder:text-bg/50",
						autoCapitalize: "off",
						autoCorrect: "off",
						autoComplete: "off",
						enterKeyHint: "search",
						inputMode: "search"
					}),
					q ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setQ("");
							navigate({ search: { q: void 0 } });
						},
						className: "flex size-9 items-center justify-center text-bg/60",
						"aria-label": "Pulisci",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: voiceSearch,
						className: "flex size-9 items-center justify-center text-bg/60",
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
					className: "chip rounded-full bg-elevated px-3 py-2 text-sm text-fg",
					children: s
				}, s))
			})] }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Sfoglia tutto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
				children: GENRES.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					search: { genre: g.id },
					className: "relative h-28 overflow-hidden rounded-lg p-3 text-base font-bold",
					style: { backgroundColor: `hsl(${hashHue(g.id)} 62% 38%)` },
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
			tracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, { title: "Brani" }), tracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
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
