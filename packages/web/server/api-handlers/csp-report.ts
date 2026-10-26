/**
 * Receives Content-Security-Policy violation reports (see
 * `config/security-headers.js`) and writes one log line per violation, so the
 * report-only phase can be read from the platform's runtime logs.
 *
 * Browsers send two formats: `report-uri` posts a single
 * `{ "csp-report": {...} }` object (Firefox, Safari), and the Reporting API
 * posts a batch of `{ type: "csp-violation", body: {...} }` (Chromium).
 *
 * Anyone can post here, so the body is size-capped, each report is reduced to
 * a few known fields, and URLs are cut to origin and path. That also keeps
 * query strings (addresses, or data a blocked request tried to carry) out of
 * the logs.
 */

import { readBodyText } from "~/server/api-handlers/request-body";

/** A batch of a few dozen reports fits comfortably. */
const MAX_BODY_BYTES = 32 * 1024;
const MAX_REPORTS_PER_REQUEST = 20;

/** Violations caused by browser extensions injecting into the page. They are
 *  not ours to fix and would drown out the rest. */
const EXTENSION_SCHEME = /^(chrome|moz|safari-web|ms-browser)-extension:/;

type CspViolation = {
  directive: string;
  blocked: string;
  document: string;
  source?: string;
  line?: number;
  disposition?: string;
};

export async function cspReportHandler(req: Request) {
  if (req.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  const text = await readBodyText(req, MAX_BODY_BYTES);
  if (text === undefined) return new Response(null, { status: 413 });

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  for (const violation of parseCspReports(body)) {
    console.warn("[csp]", JSON.stringify(violation));
  }

  return new Response(null, { status: 204 });
}

function parseCspReports(body: unknown): CspViolation[] {
  const reports = Array.isArray(body)
    ? body
        .filter((report) => isRecord(report) && report.type === "csp-violation")
        .map((report) => fromReportingApi(report.body))
    : isRecord(body)
      ? [fromReportUri(body["csp-report"])]
      : [];

  return reports
    .filter((report): report is CspViolation => report !== undefined)
    .filter(
      (report) =>
        !EXTENSION_SCHEME.test(report.blocked) &&
        !EXTENSION_SCHEME.test(report.source ?? "")
    )
    .slice(0, MAX_REPORTS_PER_REQUEST);
}

function fromReportingApi(body: unknown): CspViolation | undefined {
  if (!isRecord(body)) return undefined;
  return toViolation({
    directive: body.effectiveDirective,
    blocked: body.blockedURL,
    document: body.documentURL,
    source: body.sourceFile,
    line: body.lineNumber,
    disposition: body.disposition,
  });
}

function fromReportUri(body: unknown): CspViolation | undefined {
  if (!isRecord(body)) return undefined;
  return toViolation({
    directive: body["effective-directive"] ?? body["violated-directive"],
    blocked: body["blocked-uri"],
    document: body["document-uri"],
    source: body["source-file"],
    line: body["line-number"],
    disposition: body.disposition,
  });
}

function toViolation(
  fields: Record<string, unknown>
): CspViolation | undefined {
  if (typeof fields.directive !== "string") return undefined;
  return {
    directive: fields.directive.slice(0, 64),
    blocked: trimUrl(fields.blocked),
    document: trimUrl(fields.document),
    source:
      typeof fields.source === "string" ? trimUrl(fields.source) : undefined,
    line: typeof fields.line === "number" ? fields.line : undefined,
    disposition:
      typeof fields.disposition === "string"
        ? fields.disposition.slice(0, 16)
        : undefined,
  };
}

/** Origin and path of a URL. Keywords browsers report in place of a URL
 *  (`inline`, `eval`, `data`, `blob`) are kept as they are. */
function trimUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return url.protocol;
    }
    return (url.origin + url.pathname).slice(0, 256);
  } catch {
    return value.slice(0, 32);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
