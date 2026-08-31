import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as useFlowStore } from "./router-B9rxu5c1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stats-BK2DC5Y1.js
var import_jsx_runtime = require_jsx_runtime();
function StatsPage() {
	const listenMs = useFlowStore((s) => s.listenMs);
	const liked = useFlowStore((s) => s.liked);
	const recents = useFlowStore((s) => s.recents);
	const playlists = useFlowStore((s) => s.playlists);
	const plays = useFlowStore((s) => s.plays);
	const hours = listenMs / 36e5;
	const top = Object.entries(plays).sort((a, b) => b[1] - a[1]).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter mx-auto max-w-xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-bold tracking-tight",
				children: "Le tue stats"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Minuti, artisti e libreria — sul dispositivo e sul profilo."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Ascolto",
						value: hours < 1 ? `${Math.round(listenMs / 6e4)} min` : `${hours.toFixed(1)} h`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Preferiti",
						value: String(liked.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Playlist",
						value: String(playlists.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Recenti",
						value: String(recents.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-3 text-sm font-bold text-muted",
				children: "Artisti più ascoltati"
			}), top.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Ascolta qualche brano per compilare la classifica."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-2",
				children: top.map(([name, n], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-lg bg-surface px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 text-sm tabular-nums text-subtle",
							children: i + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm font-medium",
							children: name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted",
							children: [n, " play"]
						})
					]
				}, name))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/discover",
				className: "inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-fg",
				children: "Apri mix Scopri"
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-surface p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-2xl font-bold tabular-nums",
			children: value
		})]
	});
}
//#endregion
export { StatsPage as component };
