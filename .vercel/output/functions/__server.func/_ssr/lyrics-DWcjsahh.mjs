import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lyrics-DWcjsahh.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function stationToTrack(station) {
	return {
		id: `rd_${station.id}`,
		title: station.name,
		artist: [station.city, station.country].filter(Boolean).join(" · ") || "Radio",
		artwork: station.artwork || "/artwork-fallback.svg",
		duration: 0,
		streamUrl: station.streamUrl.startsWith("https:") ? station.streamUrl : `/api/proxy?u=${encodeURIComponent(station.streamUrl)}`,
		source: "radio",
		isLive: true
	};
}
var getHomeFeed = createServerFn({ method: "GET" }).handler(createSsrRpc("8cf6eee8babbaea2485437d5cb4b2c235dbd85b74941fe6109bbf26b9db42407"));
var searchCatalog = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("6eeca8432c020e4488999a9f520d136ca6d359bf146e4fc720286117cfb8c004"));
var getChartTracks = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("74d2cdb2d98c87a08e4dcc4ab358f071ee955183d53df01037b0507f9a6648c3"));
var getGenreMix = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("73f83a45f51d7430d01c6ba65abb1226397cf20c8962951e26bac99785823176"));
var getCountryRadios = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("e717f14110eb25ec0b39ab5ab4b7f9b3b857b73869aee0b9e1025fd5f0dba8d9"));
var getTopRadios = createServerFn({ method: "GET" }).handler(createSsrRpc("02870f145ed293cf162bbe007ee1f2f3e2e84304ede96df4483cd43ae7997e20"));
var createMoodMix = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("ec02d6163239e7f655cf1fccbdc3f61e78a074317e13902650d1532a6e9f3fe4"));
var getRelatedTracks = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("7580feac10e6253205f841f28f3415ddc74e772b735c0f713a7d07cdd35c926f"));
var getDiscoverMix = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("3a61f6d9a5b2a72932f3b42ae25bd9fea4a51eb3d0412a5c2087bade843a5521"));
var getFreshTracks = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("92d821464d41705d2e2089b73ce3a31822baedf41ef8a9033b3d6d8e81197a28"));
var getVideoTrack = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("afa95265f4f577d598099ad132c957a676be41bec0b1c639083bdf97fe9f4946"));
createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("ab37ff9b70b544c9bbbc85c414574743846319983fa1544ae2f39e0b18722c41"));
var getTrackLyrics = createServerFn({ method: "GET" }).validator((d) => d).handler(createSsrRpc("ce8a487e4cbefbdf4ec0ffa79cb9704d62902152f43f9d7d07bca5a65759f7c5"));
//#endregion
export { getDiscoverMix as a, getHomeFeed as c, getTrackLyrics as d, getVideoTrack as f, getCountryRadios as i, getRelatedTracks as l, stationToTrack as m, createSsrRpc as n, getFreshTracks as o, searchCatalog as p, getChartTracks as r, getGenreMix as s, createMoodMix as t, getTopRadios as u };
