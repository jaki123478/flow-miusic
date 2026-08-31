import { o as __toESM } from "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-BjgLBM44.mjs";
import { t as GROK_PROVIDERS } from "./server-BrgPxt8O.mjs";
import { c as Route$12 } from "./router-B9rxu5c1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-rU4a4MF8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { mode: start, next } = Route$12.useSearch();
	const dest = next || "/";
	const [mode, setMode] = (0, import_react.useState)(start === "up" ? "up" : "in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const onEmail = async (e) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const res = mode === "up" ? await authClient.signUp.email({
				email,
				password,
				name: name.trim() || email.split("@")[0]
			}) : await authClient.signIn.email({
				email,
				password
			});
			if (res.error) {
				setError(res.error.message || "Accesso non riuscito");
				return;
			}
			window.location.assign(dest);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Accesso non riuscito");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-10 items-center justify-center rounded-lg bg-primary font-heading text-lg font-bold text-primary-fg",
					children: "F"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-heading text-2xl font-bold",
					children: "Flow"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-bold tracking-tight",
				children: mode === "in" ? "Accedi per continuare" : "Crea il tuo account"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Playlist e preferiti sul tuo profilo. Puoi anche ascoltare senza account."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-2",
					children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void signIn(p.providerId, {
							callbackURL: dest,
							errorCallbackURL: "/login"
						}),
						className: "flex h-12 w-full items-center justify-center rounded-full bg-fg text-sm font-bold text-bg hover:opacity-90",
						children: ["Continua con ", p.label]
					}, p.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "my-6 flex items-center gap-3 text-xs text-subtle",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
						"oppure con email",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (e) => void onEmail(e),
					className: "space-y-3",
					children: [
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Nome",
							autoComplete: "name",
							className: "h-12 w-full rounded-lg bg-surface px-4 text-base outline-none ring-1 ring-border"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "Email",
							autoComplete: "email",
							required: true,
							className: "h-12 w-full rounded-lg bg-surface px-4 text-base outline-none ring-1 ring-border"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "Password (min. 8 caratteri)",
							autoComplete: mode === "up" ? "new-password" : "current-password",
							minLength: 8,
							required: true,
							className: "h-12 w-full rounded-lg bg-surface px-4 text-base outline-none ring-1 ring-border"
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-red-400",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "h-12 w-full rounded-full bg-primary text-sm font-bold text-primary-fg disabled:opacity-60",
							children: busy ? "Attendi…" : mode === "in" ? "Accedi" : "Crea account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setMode(mode === "in" ? "up" : "in");
						setError(null);
					},
					className: "mt-5 text-sm text-muted hover:text-fg",
					children: mode === "in" ? "Non hai un account? Registrati gratis" : "Hai già un account? Accedi"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/",
				className: "mt-8 text-center text-sm text-muted hover:text-fg",
				children: "Continua senza account"
			})
		]
	});
}
//#endregion
export { Login as component };
