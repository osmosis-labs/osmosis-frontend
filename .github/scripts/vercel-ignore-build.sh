#!/usr/bin/env bash
# Vercel "Ignored Build Step" for the osmosis-frontend project. Set it in that
# project's settings (Build and Deployment > Ignored Build Step > Custom:
# `bash .github/scripts/vercel-ignore-build.sh`), not as `ignoreCommand` in
# vercel.json: the other Vercel projects built from this repo (-dev, -edgenet,
# -datadog, osmosis-testnet) read the same vercel.json, and an ignoreCommand
# there replaces their own ignore rules, which skip PR branches entirely.
# Exit 0 skips the build, exit 1 lets it proceed.
#
# Preview builds take ~6 min each and used to run on every push to every
# branch. Skip the ones for branches that have no open PR.

# Production always builds: `yarn generate` pulls asset lists at build time,
# so a production redeploy can matter even without a code change.
if [ "$VERCEL_ENV" = "production" ]; then
  echo "Production deployment — building."
  exit 1
fi

# Previews only for branches with an open PR, draft or ready. A branch with
# no PR never runs E2E, and was about a third of all preview builds. Opening
# the PR later doesn't trigger a build, so vercel-preview-on-pr-open.yml
# deploys the head commit then.
#
# stage and master are exempt: they have an open PR only during a release,
# and stage's preview must build on every merge (it is stage.osmosis.zone and
# what the post-merge E2E run tests).
#
# VERCEL_GIT_PULL_REQUEST_ID is empty when the branch was pushed before its
# PR existed, and may be for deployments made through the API, so an empty
# value is checked against GitHub. Anything unanswered builds: a missing
# preview blocks the PR's required E2E checks, a spare one only costs a build.
if [ -z "$VERCEL_GIT_PULL_REQUEST_ID" ] &&
  [ "$VERCEL_GIT_COMMIT_REF" != "stage" ] &&
  [ "$VERCEL_GIT_COMMIT_REF" != "master" ]; then
  OPEN_PRS=$(
    curl -fsS --max-time 10 \
      ${GITHUB_PR_READ_TOKEN:+-H "Authorization: Bearer $GITHUB_PR_READ_TOKEN"} \
      -H "Accept: application/vnd.github+json" \
      "https://api.github.com/repos/$VERCEL_GIT_REPO_OWNER/$VERCEL_GIT_REPO_SLUG/pulls?state=open&per_page=1&head=$VERCEL_GIT_REPO_OWNER:$VERCEL_GIT_COMMIT_REF" |
      node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const a=JSON.parse(s);console.log(Array.isArray(a)?a.length:"")}catch{console.log("")}})'
  ) || OPEN_PRS=""

  if [ "$OPEN_PRS" = "0" ]; then
    echo "No open PR for $VERCEL_GIT_COMMIT_REF — skipping the preview."
    exit 0
  fi
  if [ -z "$OPEN_PRS" ]; then
    echo "Couldn't check GitHub for an open PR on $VERCEL_GIT_COMMIT_REF — building."
    exit 1
  fi
fi

echo "Building the preview for $VERCEL_GIT_COMMIT_REF."
exit 1
