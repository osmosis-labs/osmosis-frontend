# Security Gate - Runbook (incident response)

> **Audience:** on-call / maintainer / anyone who reached this doc because something is broken or feels wrong. For day-to-day tasks (unblocking a REJECTED PR, approving an override), see [USER_GUIDE.md](./USER_GUIDE.md). For "which doc do I want?", see [README.md](./README.md).

> **Status:** the gate is being built in phases under [MTN-34](https://linear.app/osmosis/issue/MTN-34). The incident scenarios below assume the gate is live (post-MTN-57 / Phase 04). Each section is marked with the phase that populates it; until that phase ships, the section is a stub.

## When you reach for this doc

- Something is failing or blocking that shouldn't be: workflow error, Socket outage, gate REJECTing valid PRs.
- A real attack is suspected and you need to know what to do *and not do* (do not override).
- An override turned out, post-hoc, to have approved something bad.

If none of the above, you probably want [USER_GUIDE.md](./USER_GUIDE.md) instead.

## Socket outage

> **Populated in MTN-56 (Phase 03 - Workflow).**

This section will cover:

- **Symptoms.** Socket-API calls in the workflow time out or 5xx; aggregator emits REJECTED verdicts with `reason: socket_unavailable`; sticky comments fire on every PR; #security-gate-alerts fills up.
- **Expected behaviour.** The gate fails *closed* by design - Socket being missing is treated as a high-severity finding, so all PRs touching deps are REJECTED until Socket recovers. This is intentional; do not override around it.
- **Diagnosis.** Check Socket's status page (`status.socket.dev` or the current equivalent) and the `socket` job logs in a recent failed workflow run.
- **Escalation.** Notify `#security-gate-alerts` with the suspected duration.
- **Temporary `advisory` flip.** If the outage is prolonged (>= 1 hour) and dev velocity is impacted, open a fast-track PR against [`gate-config.yml`](./gate-config.yml) flipping `mode: gate` to `mode: advisory`. CODEOWNERS reviews. **Always paired with a flip-back PR queued and a stated plan for when Socket recovers.** The flip itself posts an always-on Slack alert.

## Workflow errors

> **Populated in MTN-55 (Phase 02 - Detectors) and MTN-56 (Phase 03 - Workflow).**

This section will cover aggregator-specific failure modes:

- Missing detector input (lockfile-diff or dep-review JSON not uploaded).
- Malformed [`dep-overrides.yml`](./dep-overrides.yml) causing aggregator crash.
- Socket-API transient timeout vs sustained outage (different escalation paths).
- Workflow YAML syntax errors (caught in CI; re-running rarely helps).
- Concurrency-cancelled run vs actual error.

## Gate stuck blocking valid PRs

> **Populated in MTN-57 (Phase 04 - Go-live) and iteratively after.**

This section will cover symptom -> diagnosis -> action for cases where the gate appears to misbehave:

- Lockfile-diff false positive on a legitimate dep bump (e.g. a re-publish that's actually upstream-correct).
- Over-aggressive Socket alert on a known-good package.
- Override entry that looks valid but isn't being picked up by the aggregator (check `integrity`, `expires_at`, `added_by`).

Bias is **override-and-document** rather than weakening detector calibration on a single example.

## Republish detected (suspected real attack)

> **Populated iteratively (MTN-64).**

This section will cover incident response for Shai-Hulud-class events:

- **Do not override.** A republish is the strongest signal we have of a maintainer-account compromise. Overriding propagates the compromise to `stage`.
- Notify `#security-gate-alerts` and tag `@osmosis-labs/security-reviewers`.
- Verification: pull integrity hashes from `yarn.lock` head vs base, cross-reference against the package's npm history.
- If confirmed: full incident-response playbook (to be expanded in MTN-64 after the first real incident or near-miss).

## Override granted that turned out to be unsafe

> **Populated in MTN-58 (Phase 05 - Slash override).**

This section will cover incident response when an override is granted in good faith but later proves to have approved a real vulnerability:

- How to revoke (manifest path: edit `dep-overrides.yml`; slash-command path: re-emit failing status check + roll the change).
- Audit-trail reading - who approved, when, with what reason. Slack always-on log + workflow artifacts.
- Post-mortem template.

---

## Scope & limitations (residual risk)

The gate runs in GitHub Actions. Vercel builds the merged commit independently and does NOT run the gate. The mitigation is structural: because nothing reaches `stage` without passing the gate, Vercel only ever builds commits that have already been cleared. Runtime egress monitoring on the Vercel side is out of scope for this initiative; StepSecurity Harden-Runner is Linux-runner-only and is tracked separately under MTN-59 (Phase 06).

## See also

- [README.md](./README.md) - landing page.
- [USER_GUIDE.md](./USER_GUIDE.md) - day-to-day PR-author and reviewer tasks.
- [`gate-config.yml`](./gate-config.yml) - live config (mode + verbosity).
- [MTN-34](https://linear.app/osmosis/issue/MTN-34) - parent initiative.
