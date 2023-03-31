/**
 * The inlang config is the entry point for every inlang app.
 *
 * More information about the config is available here
 * https://inlang.com/documentation/config
 */
export async function defineConfig(env) {
    // importing inlang-plugin-json from https://github.com/samuelstroschein/inlang-plugin-json
	const plugin = await env.$import(
		"https://cdn.jsdelivr.net/gh/samuelstroschein/inlang-plugin-json@1/dist/index.js"
	);

	const pluginConfig = {
		pathPattern: "./packages/web/localizations/{language}.json",
	};

	return {
		referenceLanguage: "en",
		languages: [
			"en",
			"es",
			"fr",
			"ko",
			"pl",
			"ro",
			"tr",
			"zh-cn",
			"zh-hk",
			"zh-tw",
			"fa",
		],
		readResources: (args) => {
			return plugin.readResources({ ...args, ...env, pluginConfig });
		},
		writeResources: (args) => {
			return plugin.writeResources({ ...args, ...env, pluginConfig });
		},
	};
}
