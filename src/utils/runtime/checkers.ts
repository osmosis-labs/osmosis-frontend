export function isProdRuntime() {
	return window?.location?.hostname?.startsWith?.('app.') ?? false;
}

export function isStagingRuntime() {
	return window?.location?.hostname?.startsWith?.('staging.') ?? false;
}
