#!/usr/bin/env bash
# Wait for the Cloudflare deployment of this exact commit and event, then return
# its URL through GITHUB_OUTPUT. The artifact belongs to that successful run.
set -euo pipefail
: "${REPO:?}" "${SHA:?}" "${EVENT:?}" "${GITHUB_OUTPUT:?}"

for _ in $(seq 1 60); do
  run=$(gh api "repos/$REPO/actions/workflows/cf-deploy.yml/runs" --method GET \
    -f head_sha="$SHA" -f event="$EVENT" -f per_page=1 \
    --jq '.workflow_runs[0] // empty | [.id, .status, .conclusion] | @tsv')
  read -r run_id status conclusion <<< "$run"
  if [ "$status" = "completed" ]; then
    if [ "$conclusion" != "success" ]; then
      echo "Cloudflare deployment run $run_id for $SHA finished with $conclusion."
      exit 1
    fi
    deploy_dir=$(mktemp -d)
    trap 'rm -rf "$deploy_dir"' EXIT
    gh run download "$run_id" --repo "$REPO" --name cf-frontend-deployment --dir "$deploy_dir"
    url=$(cat "$deploy_dir/url.txt")
    [[ "$url" =~ ^https://[a-zA-Z0-9.-]+$ ]] || { echo "Invalid Cloudflare deployment URL."; exit 1; }
    echo "environment_url=${url#https://}" >> "$GITHUB_OUTPUT"
    echo "Cloudflare deployment for $SHA: $url" | tee -a "$GITHUB_STEP_SUMMARY"
    exit 0
  fi
  sleep 45
done

echo "Timed out waiting for the Cloudflare deployment of $SHA."
exit 1
