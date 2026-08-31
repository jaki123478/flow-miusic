import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as MOODS } from "./types-CuQ6ClJX.mjs";
import { t as createMoodMix } from "./lyrics-DWcjsahh.mjs";
import { I as LoaderCircle, f as Sparkles } from "../_libs/lucide-react.mjs";
import { P as TrackRow, U as useFlowStore, j as SectionHeader, s as Route$11 } from "./router-Qr86iKtp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mix-YsROsc0J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MixPage() {
	const { mood: moodId, q: seed } = Route$11.useSearch();
	const [custom, setCustom] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [blurb, setBlurb] = (0, import_react.useState)("");
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const playQueue = useFlowStore((s) => s.playQueue);
	const selected = MOODS.find((m) => m.id === moodId);
	const run = async (prompt, label) => {
		setLoading(true);
		setBlurb("");
		try {
			const res = await createMoodMix({ data: {
				mood: label,
				prompt
			} });
			setTracks(res.tracks);
			setBlurb(res.blurb);
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		if (selected) run(selected.prompt, selected.label);
		else if (seed) run(seed, seed);
	}, [selected?.id, seed]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), " Mix intelligente"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-2xl font-semibold tracking-tight",
					children: "Dimmi che umore hai"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Scegli un mood o descrivi il momento: prepariamo una selezione ascoltabile subito."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: MOODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void run(m.prompt, m.label),
					className: `chip h-11 rounded-full px-4 text-sm font-medium ${selected?.id === m.id ? "bg-primary text-primary-fg" : "bg-surface text-fg ring-1 ring-border"}`,
					children: m.label
				}, m.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					if (custom.trim()) run(custom.trim(), custom.trim());
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: custom,
					onChange: (e) => setCustom(e.target.value),
					placeholder: "Es. road trip notturno, pioggia, anni 80...",
					className: "h-12 min-w-0 flex-1 rounded-xl bg-surface px-4 text-base ring-1 ring-border outline-none placeholder:text-subtle"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "h-12 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg",
					children: "Crea"
				})]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 py-10 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), " Sto componendo il mix"]
			}) : tracks.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				blurb ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: blurb
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeader, {
					title: "Il tuo mix",
					action: "Riproduci tutto",
					onAction: () => playQueue(tracks, 0)
				}),
				tracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
					track: t,
					queue: tracks,
					index: i,
					showIndex: true
				}, t.id))
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl bg-surface px-4 py-10 text-center text-sm text-muted ring-1 ring-border",
				children: "Tocca un mood per iniziare."
			})
		]
	});
}
//#endregion
export { MixPage as component };
