import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as TrackRow, U as useFlowStore, X as followUser, Y as addSharedTrack, i as Route$3, q as useCurrentUser } from "./router-c_BOUjD0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/p._id-CDLBZTg_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SharedPage() {
	const initial = Route$3.useLoaderData();
	const { id } = Route$3.useParams();
	const [pl, setPl] = (0, import_react.useState)(initial);
	const playQueue = useFlowStore((s) => s.playQueue);
	const current = useFlowStore((s) => s.current);
	const user = useCurrentUser();
	const createPlaylistWithTracks = useFlowStore((s) => s.createPlaylistWithTracks);
	(0, import_react.useEffect)(() => {
		setPl(initial);
	}, [initial]);
	if (!pl) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter py-16 text-center text-sm text-muted",
		children: ["Playlist non trovata. ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			children: "Home"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-widest text-primary uppercase",
					children: "Playlist condivisa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-3xl font-bold tracking-tight",
					children: pl.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						"di",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/u/$id",
							params: { id: pl.userId },
							className: "hover:underline",
							children: pl.ownerName
						}),
						pl.collab ? " · collaborativa" : ""
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => playQueue(pl.tracks, 0),
						className: "h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-fg",
						children: "Riproduci"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => createPlaylistWithTracks(pl.title, pl.tracks),
						className: "h-11 rounded-full bg-elevated px-4 text-sm font-medium",
						children: "Salva in libreria"
					}),
					user && user.id !== pl.userId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void followUser({ data: { targetId: pl.userId } }),
						className: "h-11 rounded-full bg-elevated px-4 text-sm font-medium",
						children: "Segui"
					}) : null,
					pl.collab && current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							addSharedTrack({ data: {
								id,
								track: current
							} }).then((res) => {
								if (res.ok) setPl({
									...pl,
									tracks: [...pl.tracks, current]
								});
							});
						},
						className: "h-11 rounded-full bg-elevated px-4 text-sm font-medium",
						children: "Aggiungi brano in play"
					}) : null
				]
			}),
			pl.tracks.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
				track: t,
				queue: pl.tracks,
				index: i,
				showIndex: true
			}, t.id))
		]
	});
}
//#endregion
export { SharedPage as component };
