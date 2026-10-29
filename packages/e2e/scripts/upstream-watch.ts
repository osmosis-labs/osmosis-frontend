/**
 * @file upstream-watch.ts
 * @description Records whether Numia and SQS were healthy while a Playwright
 * job ran, so a failed run says on its summary page whether an upstream
 * service was degraded at the time (MTN-460).
 *
 * A 200 isn't treated as healthy on its own: Numia can answer 200 with every
 * price null, and SQS can answer while it is still catching up to the chain.
 *
 * The checks read only public Numia and SQS endpoints. They never call the
 * preview deployment, which would warm it and hide the cold-start latency the
 * tests are sensitive to, and never touch the test wallet.
 *
 * ## Usage
 * ```bash
 * # Sample every 30s until stopped (CI starts this in the background)
 * npx tsx packages/e2e/scripts/upstream-watch.ts sample
 *
 * # Summarize the samples into the job summary and annotations
 * JOB_STATUS=failure npx tsx packages/e2e/scripts/upstream-watch.ts report
 * ```
 */

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { TOKEN_DENOMS } from "../utils/balance-checker";
import { DATA_SERVICES_BASE_URL, SQS_BASE_URL } from "../utils/config";
import { notice, warning } from "../utils/github-notice";

const SAMPLES_FILE = path.join(
  process.env.RUNNER_TEMP ?? tmpdir(),
  "upstream-watch.jsonl"
);
const SAMPLE_INTERVAL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 15_000;
/** The navbar waits 9s for getUserAsset, which waits on Numia's token list
 *  (abandoned after 4s) and then on SQS prices, so one call slower than 4s
 *  uses up most of that budget. */
const SLOW_MS = 4_000;
/** Normally a few percent of tokens with liquidity have no price. The Numia
 *  outage in MTN-453 left every one of them without a price. */
const MAX_UNPRICED_SHARE = 0.2;
const MAX_SQS_HEIGHT_LAG = 20;

interface ProbeResult {
  endpoint: string;
  ms: number;
  problems: string[];
}

interface Sample {
  at: string;
  results: ProbeResult[];
}

async function probe(
  endpoint: string,
  url: string,
  check: (body: unknown) => string[]
): Promise<ProbeResult> {
  const start = Date.now();
  const problems: string[] = [];
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (response.ok) problems.push(...check(await response.json()));
    else problems.push(`HTTP ${response.status}`);
  } catch (e) {
    problems.push(`request failed: ${e instanceof Error ? e.message : e}`);
  }
  const ms = Date.now() - start;
  if (ms > SLOW_MS) problems.push(`slower than ${SLOW_MS / 1000}s`);
  return { endpoint, ms, problems };
}

function checkTokenData(body: unknown): string[] {
  if (!Array.isArray(body)) return ["response is not a token list"];
  const tokens = body as {
    denom: string;
    price: number | null;
    liquidity: number | null;
  }[];
  const problems: string[] = [];
  if (!tokens.find((token) => token.denom === "uosmo")?.price) {
    problems.push("OSMO has no price");
  }
  const liquid = tokens.filter((token) => (token.liquidity ?? 0) > 1_000);
  const unpriced = liquid.filter((token) => token.price === null).length;
  if (liquid.length === 0) problems.push("no token reports liquidity");
  else if (unpriced > liquid.length * MAX_UNPRICED_SHARE) {
    problems.push(
      `over ${MAX_UNPRICED_SHARE * 100}% of tokens with liquidity have no price`
    );
  }
  return problems;
}

function checkSqsHealth(body: unknown): string[] {
  const { chain_latest_height, store_latest_height } = body as {
    chain_latest_height?: string;
    store_latest_height?: string;
  };
  const lag = Number(chain_latest_height) - Number(store_latest_height);
  if (!Number.isFinite(lag)) return ["response has no block heights"];
  return lag > MAX_SQS_HEIGHT_LAG
    ? [`more than ${MAX_SQS_HEIGHT_LAG} blocks behind the chain`]
    : [];
}

function checkSqsPrices(body: unknown): string[] {
  const prices = (body as Record<string, Record<string, string>>).uosmo ?? {};
  return Object.values(prices).some((price) => Number(price) > 0)
    ? []
    : ["OSMO has no price"];
}

function checkSqsQuote(body: unknown): string[] {
  return Number((body as { amount_out?: string }).amount_out) > 0
    ? []
    : ["quote has no output amount"];
}

async function sample(): Promise<void> {
  writeFileSync(SAMPLES_FILE, "");
  const quoteQuery = new URLSearchParams({
    tokenIn: "1000000uosmo",
    tokenOutDenom: TOKEN_DENOMS.USDC.denom,
  });
  for (;;) {
    const at = new Date().toISOString();
    const results = await Promise.all([
      probe(
        "Numia /tokens/v2/all",
        `${DATA_SERVICES_BASE_URL}/tokens/v2/all`,
        checkTokenData
      ),
      probe("SQS /healthcheck", `${SQS_BASE_URL}/healthcheck`, checkSqsHealth),
      probe(
        "SQS /tokens/prices",
        `${SQS_BASE_URL}/tokens/prices?base=uosmo`,
        checkSqsPrices
      ),
      probe(
        "SQS /router/quote",
        `${SQS_BASE_URL}/router/quote?${quoteQuery}`,
        checkSqsQuote
      ),
    ]);
    appendFileSync(SAMPLES_FILE, `${JSON.stringify({ at, results })}\n`);
    console.log(
      at,
      results
        .map((r) => `${r.endpoint} ${r.ms}ms ${r.problems.join("; ") || "ok"}`)
        .join(" | ")
    );
    await new Promise((resolve) => setTimeout(resolve, SAMPLE_INTERVAL_MS));
  }
}

const utcTime = (iso: string) => iso.slice(11, 16);
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

function report(): void {
  // The sampler may be mid-write, so a partial last line is skipped.
  const samples: Sample[] = existsSync(SAMPLES_FILE)
    ? readFileSync(SAMPLES_FILE, "utf8")
        .split("\n")
        .flatMap((line) => {
          try {
            return [JSON.parse(line)];
          } catch {
            return [];
          }
        })
    : [];
  if (samples.length === 0) {
    warning(
      "The upstream watch recorded no samples, so there is no Numia or SQS health data for this job."
    );
    return;
  }

  const window = `${utcTime(samples[0].at)}–${utcTime(samples[samples.length - 1].at)} UTC`;
  const rows = samples[0].results.map(({ endpoint }, i) => {
    const degraded = samples.filter((s) => s.results[i].problems.length > 0);
    const counts = new Map<string, number>();
    for (const s of degraded) {
      for (const problem of s.results[i].problems) {
        counts.set(problem, (counts.get(problem) ?? 0) + 1);
      }
    }
    const ms = samples.map((s) => s.results[i].ms).sort((a, b) => a - b);
    return {
      endpoint,
      degraded,
      problems: [...counts].map(([p, n]) => `${p} (${n})`).join(", "),
      median: ms[Math.floor(ms.length / 2)],
      max: ms[ms.length - 1],
    };
  });

  for (const row of rows) {
    if (row.degraded.length === 0) continue;
    const from = utcTime(row.degraded[0].at);
    const to = utcTime(row.degraded[row.degraded.length - 1].at);
    warning(
      `${row.endpoint} was degraded in ${row.degraded.length} of ${samples.length} samples, ${from}–${to} UTC: ${row.problems}.`
    );
  }
  if (
    process.env.JOB_STATUS === "failure" &&
    rows.every((row) => row.degraded.length === 0)
  ) {
    notice(
      `This job failed while Numia and SQS stayed healthy (${samples.length} samples, ${window}).`
    );
  }

  const summary = [
    "### Upstream health during this job",
    "",
    `Sampled every ${SAMPLE_INTERVAL_MS / 1000}s, ${window} (${samples.length} samples). Numia: ${DATA_SERVICES_BASE_URL}, SQS: ${SQS_BASE_URL}.`,
    "",
    "| Endpoint | Degraded samples | Median | Max | Problems |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${row.endpoint} | ${row.degraded.length} of ${samples.length} | ${seconds(row.median)} | ${seconds(row.max)} | ${row.problems || "none"} |`
    ),
    "",
  ].join("\n");
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  }
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (mode === "sample") return sample();
  if (mode === "report") return report();
  throw new Error("Usage: upstream-watch.ts sample | report");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
