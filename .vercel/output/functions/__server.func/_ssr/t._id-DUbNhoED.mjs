import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as TrackRow, I as useFlowStore, r as Route$2 } from "./router-BM3nyifV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/t._id-DUbNhoED.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TrackSharePage() {
	const track = Route$2.useLoaderData();
	const playTrack = useFlowStore((s) => s.playTrack);
	(0, import_react.useEffect)(() => {
		if (track) playTrack(track);
	}, [track?.id]);
	if (!track) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter py-16 text-center text-sm text-muted",
		children: ["Brano non trovato. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/search",
			children: "Cerca"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: "Ascolta con Flow"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track,
				queue: [track]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Condividi questo link per ascoltare insieme lo stesso brano."
			})
		]
	});
}
//#endregion
export { TrackSharePage as component };
