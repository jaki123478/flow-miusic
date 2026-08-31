import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Pen, B as ListMusic, Q as Check, W as Heart, X as Clock, k as Play } from "../_libs/lucide-react.mjs";
import { F as TrackRow, G as cn, J as useCurrentUser, W as useFlowStore, r as Route$2 } from "./router-DXP7Hs_g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/u.-dLuEgChP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const cloudPlaylists = Route$2.useLoaderData();
	const { id } = Route$2.useParams();
	const user = useCurrentUser();
	const profileName = useFlowStore((s) => s.profileName);
	const setProfileName = useFlowStore((s) => s.setProfileName);
	const liked = useFlowStore((s) => s.liked);
	const recents = useFlowStore((s) => s.recents);
	const localPlaylists = useFlowStore((s) => s.playlists);
	const listenMs = useFlowStore((s) => s.listenMs);
	const playQueue = useFlowStore((s) => s.playQueue);
	const notify = useFlowStore((s) => s.notify);
	const [tab, setTab] = (0, import_react.useState)("liked");
	const [editingName, setEditingName] = (0, import_react.useState)(false);
	const [tempName, setTempName] = (0, import_react.useState)(profileName || "Flow User");
	const isMe = !user || user.id === id || id === "me";
	const displayName = isMe ? user?.displayName || user?.primaryEmail || profileName || "Flow User" : cloudPlaylists[0]?.ownerName || "Utente Flow";
	const hours = Math.round(listenMs / 36e4) / 10;
	const minutes = Math.round(listenMs / 6e4);
	const timeLabel = hours >= 1 ? `${hours} ore` : `${minutes} min`;
	const handleSaveName = () => {
		if (tempName.trim()) {
			setProfileName(tempName.trim());
			notify(`Nome aggiornato in "${tempName.trim()}"`);
		}
		setEditingName(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flow-enter mx-auto max-w-4xl space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface to-elevated p-6 md:p-8 shadow-xl ring-1 ring-white/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col md:flex-row items-center gap-6 text-center md:text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative size-24 md:size-28 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-primary via-emerald-400 to-teal-300 p-1 shadow-lg ring-4 ring-primary/20",
						children: user?.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: user.profileImageUrl,
							alt: displayName,
							className: "size-full rounded-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-full items-center justify-center rounded-full bg-[#14171E] text-3xl font-black text-primary",
							children: displayName.charAt(0).toUpperCase()
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-center md:justify-start gap-2",
								children: [editingName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "text",
										value: tempName,
										onChange: (e) => setTempName(e.target.value),
										className: "h-9 rounded-xl bg-bg px-3 text-lg font-bold text-fg ring-1 ring-primary focus:outline-none",
										autoFocus: true,
										onKeyDown: (e) => e.key === "Enter" && handleSaveName()
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: handleSaveName,
										className: "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-fg",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "text-2xl md:text-3xl font-black tracking-tight text-fg",
										children: displayName
									}), isMe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setTempName(displayName);
											setEditingName(true);
										},
										className: "rounded-full p-1 text-muted hover:text-fg hover:bg-white/10 transition-colors",
										title: "Modifica nome",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "size-3.5" })
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider",
									children: "Flow Hi-Fi"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "Profilo attivo · Statistiche e sincronizzazione in tempo reale"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1",
								children: [liked.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => playQueue(liked, 0),
									className: "flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-fg shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5 fill-current" }),
										"Riproduci Preferiti (",
										liked.length,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/library",
									className: "flex h-9 items-center gap-2 rounded-full bg-surface px-4 text-xs font-bold text-fg ring-1 ring-white/10 hover:bg-elevated transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "size-3.5" }), "Libreria Completa"]
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/10 pt-5 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-surface/50 p-3 ring-1 ring-white/5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-muted",
								children: "Ascolto"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-lg font-black text-fg",
								children: timeLabel
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-surface/50 p-3 ring-1 ring-white/5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-muted",
								children: "Brani Preferiti"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-lg font-black text-primary",
								children: liked.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-surface/50 p-3 ring-1 ring-white/5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-muted",
								children: "Le Mie Playlist"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-lg font-black text-fg",
								children: localPlaylists.length + cloudPlaylists.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-surface/50 p-3 ring-1 ring-white/5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-medium text-muted",
								children: "Recenti"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-lg font-black text-fg",
								children: recents.length
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-b border-border pb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab("liked"),
						className: cn("flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all", tab === "liked" ? "bg-primary text-primary-fg shadow-md" : "bg-surface text-muted hover:text-fg"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-3.5" }),
							"Preferiti (",
							liked.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab("playlists"),
						className: cn("flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all", tab === "playlists" ? "bg-primary text-primary-fg shadow-md" : "bg-surface text-muted hover:text-fg"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "size-3.5" }),
							"Playlist (",
							localPlaylists.length + cloudPlaylists.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab("recents"),
						className: cn("flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all", tab === "recents" ? "bg-primary text-primary-fg shadow-md" : "bg-surface text-muted hover:text-fg"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3.5" }),
							"Cronologia (",
							recents.length,
							")"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					tab === "liked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: liked.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-16 text-center text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-12 opacity-20 mb-3 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base font-bold text-fg",
								children: "Nessun brano preferito"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted max-w-sm",
								children: "Tocca il cuore su qualsiasi canzone per salvarla direttamente qui nel tuo profilo."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/discover",
								className: "mt-4 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-fg",
								children: "Esplora Brani"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1",
						children: liked.map((track, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
							track,
							queue: liked,
							index: i,
							showIndex: true
						}, `${track.id}-${i}`))
					}) }),
					tab === "playlists" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3",
						children: localPlaylists.length === 0 && cloudPlaylists.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-full flex flex-col items-center justify-center py-16 text-center text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "size-12 opacity-20 mb-3 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-base font-bold text-fg",
									children: "Nessuna playlist creata"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted max-w-sm",
									children: "Crea le tue playlist o importale da Spotify e YouTube nella sezione Libreria."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/library",
									className: "mt-4 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-bold text-primary-fg",
									children: "Vai a Libreria"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [localPlaylists.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/p/$id",
							params: { id: p.id },
							className: "group flex items-center justify-between rounded-2xl bg-surface p-4 ring-1 ring-white/5 hover:bg-elevated transition-all",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-bold text-fg group-hover:text-primary transition-colors",
									children: p.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted mt-0.5",
									children: [p.trackIds.length, " brani"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-fg transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5 fill-current ml-0.5" })
							})]
						}, p.id)), cloudPlaylists.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/p/$id",
							params: { id: p.id },
							className: "group flex items-center justify-between rounded-2xl bg-surface p-4 ring-1 ring-white/5 hover:bg-elevated transition-all",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-bold text-fg group-hover:text-primary transition-colors",
									children: p.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted mt-0.5",
									children: [p.tracks.length, " brani · Cloud"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-fg transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5 fill-current ml-0.5" })
							})]
						}, p.id))] })
					}),
					tab === "recents" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: recents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center justify-center py-16 text-center text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-12 opacity-20 mb-3 text-primary" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-base font-bold text-fg",
								children: "Nessuna cronologia"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted max-w-sm",
								children: "I brani che ascolti appariranno automaticamente qui."
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-1",
						children: recents.map((track, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrackRow, {
							track,
							queue: recents,
							index: i,
							showIndex: true
						}, `${track.id}-${i}`))
					}) })
				]
			})
		]
	});
}
//#endregion
export { ProfilePage as component };
