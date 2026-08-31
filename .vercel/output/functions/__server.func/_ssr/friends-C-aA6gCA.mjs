import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as useFlowStore, W as listFriendsFeed } from "./router-DS4VRhq6.mjs";
import { n as SignedOut, t as SignedIn } from "./gates-CkCyq3mL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/friends-C-aA6gCA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FriendsPage() {
	const playQueue = useFlowStore((s) => s.playQueue);
	const [items, setItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		listFriendsFeed().then(setItems).catch(() => setItems([]));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-bold tracking-tight",
				children: "Amici"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Playlist pubbliche di chi segui."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedOut, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					search: { mode: "up" },
					className: "font-semibold text-primary",
					children: "Registrati"
				}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: "per seguire gli amici."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Segui qualcuno da una playlist pubblica per vedere il feed."
			}) : items.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-surface p-4 ring-1 ring-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/p/$id",
						params: { id: p.id },
						className: "text-sm font-semibold hover:underline",
						children: p.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							p.ownerName,
							" · ",
							p.tracks.length,
							" brani"
						]
					}),
					p.tracks[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => playQueue(p.tracks, 0),
						className: "mt-2 text-xs font-bold text-primary",
						children: "Riproduci"
					}) : null
				]
			}, p.id)) })
		]
	});
}
//#endregion
export { FriendsPage as component };
