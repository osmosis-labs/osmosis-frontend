# Security Gate (osmosis-frontend)

A CI check that scans dependency changes for supply-chain risk before they reach `stage`. Built in phases under [MTN-34](https://linear.app/osmosis/issue/MTN-34).

## Status

The gate is not yet live as of this PR. See [`gate-config.yml`](./gate-config.yml) for the current `mode` (the source of truth):

- `mode: gate` -> blocking; REJECTED verdicts prevent merge.
- `mode: advisory` -> observe-only; verdicts post but never block.

The workflow that consumes this config lands in MTN-56 (Phase 03). The mode is flipped to `gate` in MTN-57 (Phase 04). Until then, nothing in CI is actively gated.

## Where to go

| You... | Go here |
|---|---|
| ...got a REJECTED comment on your PR | [USER_GUIDE.md - Unblocking a REJECTED PR](./USER_GUIDE.md#unblocking-a-rejected-pr) |
| ...want to understand what the sticky comment is telling you | [USER_GUIDE.md - Reading the sticky comment](./USER_GUIDE.md#reading-the-sticky-comment) |
| ...are being asked to approve an override | [USER_GUIDE.md - Approving an override](./USER_GUIDE.md#approving-an-override) |
| ...want to know if your dep bump will be blocked, before pushing | [USER_GUIDE.md - Previewing gate behavior](./USER_GUIDE.md#previewing-gate-behavior) |
| ...think Socket is down, the workflow is erroring, or the gate is blocking valid PRs | [RUNBOOK.md](./RUNBOOK.md) |
| ...want to change the gate's mode or verbosity | Open a PR against [`gate-config.yml`](./gate-config.yml); [CODEOWNERS](../CODEOWNERS) routes review |
| ...want to add a recurring exemption | Open a PR against [`dep-overrides.yml`](./dep-overrides.yml); the override entry's `added_by` must name a reviewer, not the PR author being unblocked |

## How these docs are organised

| File | Role | When you read it |
|---|---|---|
| [README.md](./README.md) | This landing page | First touch / "which doc?" |
| [USER_GUIDE.md](./USER_GUIDE.md) | Task playbook for PR authors and override reviewers | ~80% of reads |
| [RUNBOOK.md](./RUNBOOK.md) | Incident response (Socket down, workflow errors, suspected attack) | ~10% of reads, usually under stress |

Architecture lives inline in the gate's source code (comments on the aggregator and detector scripts in MTN-55, the workflow in MTN-56) plus the [Linear issue tree](https://linear.app/osmosis/issue/MTN-34).

## Phased rollout

Each phase under MTN-34 is its own Linear issue. Documentation content is added by the phase that introduces the user-facing behavior - see each phase's "Documentation deliverables" section in Linear. The doc *structure* (this directory) is established here in MTN-80.
