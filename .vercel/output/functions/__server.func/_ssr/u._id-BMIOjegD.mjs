import { S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { U as useFlowStore, X as followUser, n as Route$1, q as useCurrentUser } from "./router-CES2qiM-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/u._id-BMIOjegD.js
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const items = Route$1.useLoaderData();
	const { id } = Route$1.useParams();
	const user = useCurrentUser();
	const playQueue = useFlowStore((s) => s.playQueue);
	const name = items[0]?.ownerName || "Utente";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-bold tracking-tight",
				children: name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [items.length, " playlist pubbliche"]
			})] }), user && user.id !== id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void followUser({ data: { targetId: id } }),
				className: "h-10 rounded-full bg-fg px-4 text-sm font-bold text-bg",
				children: "Segui"
			}) : null]
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Nessuna playlist pubblica."
		}) : items.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between rounded-lg bg-surface px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/p/$id",
				params: { id: p.id },
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-semibold",
					children: p.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [p.tracks.length, " brani"]
				})]
			}), p.tracks[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => playQueue(p.tracks, 0),
				className: "text-xs font-bold text-primary",
				children: "Play"
			}) : null]
		}, p.id))]
	});
}
//#endregion
export { ProfilePage as component };
