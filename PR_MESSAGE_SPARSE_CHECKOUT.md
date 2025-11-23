## What is the purpose of the change:

This PR fixes a critical bug across 5 E2E workflow files where the `cache dependencies` step was failing (or at risk of failing) due to a missing `yarn.lock` file during sparse checkout.

**Root Cause:**
The sparse checkout configuration introduced in PR #3984 only includes `packages/e2e`. This causes `yarn.lock` (located at the repository root) to be excluded from the checkout. Consequently, `hashFiles('**/yarn.lock')` fails to generate a cache key when running without an existing cache.

**Impact:**

- **Broken:** `monitoring-limit-geo-e2e-tests.yml` (Currently failing in production)
- **At Risk:** All other E2E workflows using sparse checkout will fail as soon as their caches expire or env vars change.

**Solution:**
This PR adds `yarn.lock` to the sparse-checkout allowlist for all affected workflows **and** disables cone mode (`sparse-checkout-cone-mode: false`) so Git uses pattern mode and actually fetches standalone files like `yarn.lock`:

1. `.github/workflows/monitoring-limit-geo-e2e-tests.yml` (8 jobs)
2. `.github/workflows/frontend-e2e-tests.yml` (5 jobs)
3. `.github/workflows/monitoring-e2e-tests.yml` (1 job)
4. `.github/workflows/prod-frontend-e2e-tests.yml` (2 jobs)
5. `.github/workflows/monitoring-quote-geo-e2e-tests.yml` (1 job)

## Brief Changelog

- Updated `sparse-checkout` configuration in 5 workflow files to include `yarn.lock` and set `sparse-checkout-cone-mode: false`.

## Testing and Verifying

**Verification Steps:**

1. Trigger any of the modified workflows manually using `workflow_dispatch`.
2. Verify that the "Cache dependencies" step completes successfully.
3. Confirm that the cache key is generated correctly (e.g., `Linux-22.x-<hash>`).

**Expected Result:**

- CI jobs should pass the "Cache dependencies" step without the "template is not valid" error.
- Performance remains optimized (only downloading `packages/e2e` + `yarn.lock`).

## References

- **Failing Run:** https://github.com/osmosis-labs/osmosis-frontend/actions/runs/19597283334/job/56123805415
- **Original PR:** #3984
