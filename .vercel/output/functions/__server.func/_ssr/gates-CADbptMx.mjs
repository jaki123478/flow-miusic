import "../_runtime.mjs";
import { H as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { J as useCurrentUserState } from "./router-CES2qiM-.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
/** Render children only when a user is present (real session, or the disabled-auth dev user). */
function SignedIn({ children }) {
	const { user } = useCurrentUserState();
	return user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children }) : null;
}
/**
* Render children only once we KNOW the visitor is signed out (`isPending` has
* cleared and there is no user). Hidden while the session is still loading.
*/
function SignedOut({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending || user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
//#endregion
export { SignedOut as n, SignedIn as t };
