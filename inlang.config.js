// https://inlang.com/documentation

export async function defineConfig(env) {

	const plugin = await env.$import(
		"https://cdn.jsdelivr.net/gh/samuelstroschein/inlang-plugin-json@1/dist/index.js"
	);

	const { standardLintRules } = await env.$import(
    "https://cdn.jsdelivr.net/gh/inlang/standard-lint-rules@1/dist/index.js"
  );

	const pluginConfig = {
		pathPattern: "./packages/web/localizations/{language}.json",
	};

	return {
		referenceLanguage: "en",
		languages: await plugin.getLanguages({ ...env, pluginConfig }),
		readResources: (args) => {
			return plugin.readResources({ ...args, ...env, pluginConfig });
		},
		writeResources: (args) => {
			return plugin.writeResources({ ...args, ...env, pluginConfig });
		},
		lint: [ standardLintRules() ],
	};
}
