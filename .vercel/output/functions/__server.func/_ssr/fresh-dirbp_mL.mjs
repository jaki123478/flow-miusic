import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as getFreshTracks } from "./lyrics-DWcjsahh.mjs";
import { A as LoaderCircle } from "../_libs/lucide-react.mjs";
import { D as TrackRow, I as useFlowStore } from "./router-FR9i_wyR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fresh-dirbp_mL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FreshPage() {
	const liked = useFlowStore((s) => s.liked);
	const followed = useFlowStore((s) => s.followedArtists);
	const playQueue = useFlowStore((s) => s.playQueue);
	const [tracks, setTracks] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const artists = [...followed, ...liked.map((t) => t.artist)].filter((a, i, arr) => a && arr.indexOf(a) === i).slice(0, 5);
		getFreshTracks({ data: { artists } }).then(setTracks).finally(() => setLoading(false));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-bold tracking-tight",
			children: "Novità"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Nuove uscite e brani freschi dagli artisti che segui."
		})] }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin text-muted" }) : tracks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => playQueue(tracks, 0),
			className: "h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-fg",
			children: "Riproduci novità"
		}), tracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
			track: t,
			queue: tracks,
			index: i,
			showIndex: true
		}, t.id))] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Segui un artista (menu brano) per vedere le novità."
		})]
	});
}
//#endregion
export { FreshPage as component };
