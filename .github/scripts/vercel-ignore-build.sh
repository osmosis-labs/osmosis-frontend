#!/usr/bin/env bash
# Retain this entry point for Vercel projects whose Ignored Build Step setting
# still calls it. Cloudflare owns deployments; exit 0 skips obsolete builds.
echo "Cloudflare owns frontend deployments; skipping Vercel."
exit 0
