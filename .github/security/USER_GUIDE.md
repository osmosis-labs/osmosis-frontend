# Security Gate - User Guide

> **Audience:** PR authors and override reviewers - the two flows that interact with the security gate as users. For incidents (Socket outage, workflow errors), see [RUNBOOK.md](./RUNBOOK.md). For "which doc do I want?", see [README.md](./README.md).

> **Status:** the gate is being built in phases under [MTN-34](https://linear.app/osmosis/issue/MTN-34). Sections below are marked with the phase that populates them. Until that phase lands, the section is a stub - the structure exists so the doc can grow without re-organisation.

## Quick reference

| I want to... | Go to |
|---|---|
| Understand a sticky comment | [Reading the sticky comment](#reading-the-sticky-comment) |
| Find out what each finding kind means | [Finding kinds](#finding-kinds) |
| Unblock my REJECTED PR | [Unblocking a REJECTED PR](#unblocking-a-rejected-pr) |
| Check if my dep bump will be blocked before pushing | [Previewing gate behavior](#previewing-gate-behavior) |
| Know what to do while waiting for an override | [Waiting for an override](#waiting-for-an-override) |
| Approve an override (reviewer) | [Approving an override](#approving-an-override) |
| Use the slash-command override | [Using the security-override command](#using-the-security-override-command) |
| Tell what mode the gate is in | [Advisory mode vs gate mode](#advisory-mode-vs-gate-mode) |
| Change the gate's mode or verbosity | [Changing the gate's config](#changing-the-gates-config) |

---

## For PR authors

### Reading the sticky comment

> **Populated in MTN-55 (Phase 02 - Detectors).** Until then, no sticky comment exists yet; the aggregator that emits it lands in that phase.

This section will cover:

- The three verdict types: `APPROVED`, `NEEDS_HUMAN_REVIEW`, `REJECTED` - what each means for your PR and what to do next.
- The summary table - one row per detector with counts at each severity.
- The per-finding `<details>` blocks - how to expand and interpret them.
- Severity meaning: `high` blocks merge (in gate mode); `medium` triggers `NEEDS_HUMAN_REVIEW`; `low` is informational.

### Finding kinds

> **Populated in MTN-56 (Phase 03 - Workflow).** The detectors are built in MTN-55, but you only encounter finding kinds via the workflow that ships in MTN-56.

This section will be a per-finding-kind reference, one row each, covering what it means / why it matters / default user action:

- `republish` (lockfile-diff)
- `new-transitive` (lockfile-diff)
- `resolved-change` (lockfile-diff)
- `new-bin` (lockfile-diff)
- `install-script` (lockfile-diff)
- `resolutions-change` (lockfile-diff)
- Socket categories (separate rows per Socket alert type)
- `dep-review` (license, known CVE, etc.)

### Unblocking a REJECTED PR

> **Populated in MTN-57 (Phase 04 - Go-live).** Before MTN-57 the gate is in advisory mode and REJECTED verdicts do not block merges, so this content lands when the verdict actually starts blocking.

> **Hard go-live gate:** the mode flip from `advisory` to `gate` is blocked on a doc self-serve test - a teammate not previously involved with the gate must be able to take a REJECTED test PR through to APPROVED using only this section. See MTN-57 for details.

This section will be a step-by-step decision tree with three branches:

1. **The finding is real and you need an override.** Steps to open the override PR, who reviews it, what to put in [`dep-overrides.yml`](./dep-overrides.yml), how to get the override back onto your branch.
2. **The finding is spurious - you accidentally pulled in an unexpected change.** Steps to fix the manifest / lockfile and re-push.
3. **The finding is real and not overridable.** When to bail out and pick a different dep.

Each branch ends in a concrete next action, not a "contact the team" dead end.

### Previewing gate behavior

> **Populated in MTN-56 (Phase 03 - Workflow).**

This section will cover running the detectors locally on a candidate dep change before pushing, so you can verify a risky bump without bouncing off CI. Approximate shape (final commands land in MTN-55 / MTN-56):

```bash
node .github/security/scripts/lockfile-diff-guard.mjs --base origin/stage --head HEAD
```

(plus aggregator + Socket invocations).

### Waiting for an override

> **Populated in MTN-57 (Phase 04 - Go-live).**

This section will cover what a PR author should do while a reviewer is preparing your override - including how to verify the override entry looks valid before it hits the gate again, so the re-run loop doesn't bounce twice.

---

## For override reviewers

### Approving an override

> **Populated in MTN-58 (Phase 05 - Slash override).**

> **Highest-leverage section in this doc.** Reviewer rubber-stamping is the most plausible failure mode for the whole gate. The checklist here is the structural defence; if it gets habitually skipped, the gate becomes ceremony.

This section will be a reviewer checklist, in order of how easy each item is to skip:

- **Two-person rule enforced.** `added_by` must not equal the PR author being unblocked. The slash command (MTN-58) enforces this in code; for the manifest path, you the reviewer enforce it visually.
- **Integrity hash verified.** The `integrity` field in the override matches the one in `yarn.lock`. A mismatched hash means the override applies to a *different* package version than what's actually being installed.
- **Reason field documented.** >= 10 chars, specific to *this* finding. "Known CVE, low-risk for our use, transitive only" - good. "approve" - not good.
- **Expiry sensible.** Max 90 days. Shorter if the underlying advisory is expected to be fixed upstream sooner.
- **Security finding actually understood, not just dismissed.** If you cannot explain in one sentence what was being approved, do not approve. This is the one that catches you on a busy day.
- For *recurring* exemptions (e.g. a transitive dep that always trips dep-review for an accepted license), prefer the manifest path; for *one-off* unblocks, the slash command (MTN-58) is fine.

### Reviewing a gate-config or workflow change

> **Stub - content carries forward iteratively as real gate-config changes arrive.**

When a PR changes:

- [`gate-config.yml`](./gate-config.yml) (`mode` or `slack_verbosity`) - is the mode change temporary, with a stated plan to flip back? Is the verbosity change reducing noise or hiding alerts?
- [`dep-overrides.yml`](./dep-overrides.yml) - run each override through [Approving an override](#approving-an-override).
- `.github/workflows/dep-security-gate.yml` (lands in MTN-56) - are detectors being weakened? Are permissions being broadened beyond least-privilege? Is the always-on Slack list being silenced?

### Using the security-override command

> **Populated in MTN-58 (Phase 05 - Slash override).**

This section will cover the `/security-override <reason>` slash command: how to invoke, who can invoke (the override-granting team, not the PR author), what gets logged, and how to revoke.

---

## For everyone

### Advisory mode vs gate mode

> **Populated in MTN-57 (Phase 04 - Go-live).** The mode flip lands in that phase; until then the field exists in [`gate-config.yml`](./gate-config.yml) but the workflow that honours it does not yet ship.

This section will cover:

- How to tell which mode is active: read `mode:` in [`gate-config.yml`](./gate-config.yml).
- What each mode means for your PR (`gate` = blocking; `advisory` = observe-only).
- When reviewers might intentionally flip to `advisory`: Socket outage recovery, false-positive investigation. These flips should always be paired with a stated plan for flipping back.

### Changing the gate's config

Open a PR against [`gate-config.yml`](./gate-config.yml). The file is owned by `@osmosis-labs/security-reviewers` via [CODEOWNERS](../CODEOWNERS), so review is enforced. The same CODEOWNERS rule applies to:

- [`dep-overrides.yml`](./dep-overrides.yml) - the exemption list.
- [`RUNBOOK.md`](./RUNBOOK.md), [`USER_GUIDE.md`](./USER_GUIDE.md), [`README.md`](./README.md) - this directory's docs.
- [`../CODEOWNERS`](../CODEOWNERS) itself, by self-protection (added in MTN-54).

Field reference:

- `mode: gate` -> REJECTED verdicts block merges.
- `mode: advisory` -> REJECTED verdicts still post the sticky comment and Slack alert, but the status check passes. Use only for short windows (false-positive investigation, infrastructure recovery, etc.) and flip back as soon as possible.
- `slack_verbosity: verbose | alerts | silent` - tune signal-to-noise in `#security-gate-alerts`. Always-on events bypass this setting.
- **Always-on events** (post regardless of verbosity): REJECTED verdicts, override granted, republish detected, Socket outage, workflow error.

### Glossary

> **Populated iteratively (MTN-64).**

Quick definitions for terms you'll see in the sticky comment, this guide, and the runbook: aggregator, dep-review, integrity, lockfile-diff, override (manifest vs slash), republish, Shai-Hulud, Socket, sticky comment, verdict.

---

## See also

- [README.md](./README.md) - landing page for these docs.
- [RUNBOOK.md](./RUNBOOK.md) - incident response (when the gate itself is broken or under attack).
- [`gate-config.yml`](./gate-config.yml) - the live config (mode + verbosity).
- [`dep-overrides.yml`](./dep-overrides.yml) - the exemption list.
- [`../CODEOWNERS`](../CODEOWNERS) - who reviews changes to this directory.
- [MTN-34](https://linear.app/osmosis/issue/MTN-34) - the parent initiative tracking the build-out.
