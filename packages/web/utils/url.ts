export function normalizeRestBaseUrl(urlString: string): string {
  const url = new URL(urlString);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Invalid protocol");
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error("Invalid URL components");
  }

  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  return pathname === "/" ? url.origin : `${url.origin}${pathname}`;
}

export function findAllowedRestEndpoint(
  restEndpoint: string,
  allowedAddresses: string[]
): string | null {
  let normalizedEndpoint: string;
  try {
    normalizedEndpoint = normalizeRestBaseUrl(restEndpoint);
  } catch {
    return null;
  }

  for (const address of allowedAddresses) {
    try {
      if (normalizeRestBaseUrl(address) === normalizedEndpoint) {
        return normalizedEndpoint;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function removeQueryParam(key: string) {
  if (!key) return;
  if (typeof window === "undefined") return;
  const url = new URL(location.href);
  url.searchParams.delete(key);
  window.history.replaceState(null, document.title, url.href);
}
