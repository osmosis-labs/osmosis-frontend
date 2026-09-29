#!/usr/bin/env bash
# Vercel "Ignored Build Step" for the osmosis-frontend project. Set it in that
# project's settings (Git > Ignored Build Step > Custom:
# `bash .github/scripts/vercel-ignore-build.sh`), not as `ignoreCommand` in
# vercel.json: the other Vercel projects built from this repo (-dev, -edgenet,
# -datadog, osmosis-testnet) read the same vercel.json, and an ignoreCommand
# there replaces their own ignore rules, which skip PR branches entirely.
# Exit 0 skips the build, exit 1 lets it proceed.
#
# Preview builds take ~6 min each and used to run on every push to every
# branch, including draft PRs and commits that never touch the app. Skip a
# preview when nothing that @osmosis-labs/web depends on has changed since the
# last deployed commit on the branch.

# Production always builds: `yarn generate` pulls asset lists at build time,
# so a production redeploy can matter even without a code change.
if [ "$VERCEL_ENV" = "production" ]; then
  echo "Production deployment — building."
  exit 1
fi

# The preview E2E suite runs against this deployment, so changes to the tests
# or their workflow still need one even though web does not depend on them.
if [ -n "$VERCEL_GIT_PREVIOUS_SHA" ] &&
  git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA^{commit}" 2>/dev/null; then
  if ! git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" HEAD -- \
    packages/e2e .github/workflows/frontend-e2e-tests.yml; then
    echo "E2E tests changed — building so they have a preview to run against."
    exit 1
  fi
fi

# turbo-ignore exits 0 when neither @osmosis-labs/web nor any workspace it
# depends on changed, and 1 (build) when they did or it can't tell.
npx -y turbo-ignore@2 @osmosis-labs/web
