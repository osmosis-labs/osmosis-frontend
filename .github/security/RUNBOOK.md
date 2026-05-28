# Dependency Security Gate - RUNBOOK (v1)

## TL;DR

> **Status:** the gate is being built in phases under MTN-34. This file (MTN-54 / Phase 01) lands inert configuration scaffolding only - no workflow runs yet, and no PR is being scanned. The behaviour described below takes effect once the gate workflow lands in MTN-56 (Phase 03) and is flipped to `gate` mode in MTN-57 (Phase 04).

- A blocking CI check (`dep-security-gate`) scans every PR that touches `yarn.lock` or `package.json` for supply-chain risk.
- A REJECTED verdict means the merge is blocked until either the underlying finding is resolved or an override is approved by `@osmosis-labs/security-reviewers`.
- Behavior (block vs advisory) and Slack verbosity are configured in [`.github/security/gate-config.yml`](./gate-config.yml).

> This is the minimal v1 runbook. It will be expanded iteratively under MTN-64 (Phase 11) as real questions and incidents accumulate. Until then, escalate edge cases in `#security-gate-alerts`.

## I just got a REJECTED comment on my PR - what now?

Triage in order:

1. **Read the sticky comment.** The aggregator names exactly which detector fired (`lockfile-diff`, `socket`, or `dep-review`), which package, and the kind of finding (e.g. `republish`, `install-script`, `new-bin`, known CVE, behavioral risk).
2. **Is the underlying change actually intentional?**
   - If you accidentally bumped something or pulled in an unexpected transitive dep, fix the manifest / lockfile and push again. The gate re-runs automatically.
   - If the bump is intentional and the finding is real but low-risk for our use, you need an override.
3. **Request an override** from `@osmosis-labs/security-reviewers`. The follow-up PR that adds an entry to [`.github/security/dep-overrides.yml`](./dep-overrides.yml) must be opened by, or contain an entry added by, an approving reviewer other than the PR author being unblocked. Required fields:
   - `package`, `version`, `integrity` (copy from `yarn.lock`).
   - `reason` - one-sentence justification; this is the audit trail.
   - `added_by` - GitHub username of the approving reviewer who added the override entry. Must not equal the PR author of the PR being unblocked.
   - `added_at` / `expires_at` - ISO dates, max 90 days apart.
   - The override PR is reviewed by `@osmosis-labs/security-reviewers` (enforced via CODEOWNERS).
4. **After the override merges to your branch's base** (`stage`), rebase or merge `stage` into your PR. The gate re-runs and the override is applied; the sticky comment flips to APPROVED.
5. **If the finding looks like a real attack** (Shai-Hulud-class republish, install script reaching out to a suspicious host, etc.), do NOT override. Post in `#security-gate-alerts` and tag `@osmosis-labs/security-reviewers` for incident handling.

## How do I read the sticky comment?

The aggregator (MTN-55 / Phase 02) emits a single sticky comment per PR with three sections:

- **Verdict header** - one of `APPROVED`, `NEEDS_HUMAN_REVIEW`, or `REJECTED`, plus the reason.
- **Summary table** - one row per detector with finding counts at each severity.
- **Findings detail** - collapsed `<details>` blocks per finding with the kind, package, evidence, and a link back to this runbook.

Always-on Slack alerts (REJECTED verdicts, override events, republish detections, Socket outages, workflow errors) post to `#security-gate-alerts` regardless of `slack_verbosity`.

## How do I change the gate's mode or Slack verbosity?

Open a PR that edits [`.github/security/gate-config.yml`](./gate-config.yml). The file is owned by `@osmosis-labs/security-reviewers` via CODEOWNERS, so it forces a review.

- `mode: gate` -> REJECTED verdicts block merges.
- `mode: advisory` -> REJECTED verdicts still post the sticky comment and Slack alert, but the status check passes. Use this only for short windows (false-positive investigation, infrastructure recovery, etc.) and flip back as soon as possible.
- `slack_verbosity: verbose | alerts | silent` - tune signal-to-noise in `#security-gate-alerts`. Always-on events (see above) bypass this setting.

## Vercel residual-risk note

The gate runs in GitHub Actions. Vercel builds the merged commit independently and does NOT run the gate. The mitigation is structural: because nothing reaches `stage` without passing the gate, Vercel only ever builds commits that have already been cleared. Runtime egress monitoring on the Vercel side is out of scope for this initiative (StepSecurity Harden-Runner is Linux-runner-only and is tracked separately under MTN-59 / Phase 06).
