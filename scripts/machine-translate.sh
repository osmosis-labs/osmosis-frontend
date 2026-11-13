#!/usr/bin/env bash
# Fills missing strings in packages/web/localizations with the inlang CLI, then
# formats the result.
#
# A provider and key are required. Without them inlang CLI v3 falls back to
# translate.demosjarco.dev, a community service inlang doesn't run, and we
# don't send wallet UI copy there.
#
#   INLANG_MACHINE_TRANSLATE_PROVIDER=google INLANG_GOOGLE_TRANSLATE_API_KEY=... yarn machine-translate
#   INLANG_MACHINE_TRANSLATE_PROVIDER=deepl  INLANG_DEEPL_API_KEY=...            yarn machine-translate
#
# The CLI runs through `yarn dlx` at a pinned version so its ~190 MB of
# dependencies stay out of node_modules for every install.
set -uo pipefail

readonly INLANG_CLI_VERSION="3.4.4"

cd "$(dirname "$0")/.."

case "${INLANG_MACHINE_TRANSLATE_PROVIDER:-}" in
  google) key_var="INLANG_GOOGLE_TRANSLATE_API_KEY" ;;
  deepl) key_var="INLANG_DEEPL_API_KEY" ;;
  *)
    echo "Set INLANG_MACHINE_TRANSLATE_PROVIDER to \"google\" or \"deepl\"." >&2
    exit 1
    ;;
esac

if [ -z "${!key_var:-}" ]; then
  echo "Set ${key_var} for the ${INLANG_MACHINE_TRANSLATE_PROVIDER} provider." >&2
  exit 1
fi

status=0
yarn dlx "@inlang/cli@${INLANG_CLI_VERSION}" machine translate --project ./project.inlang || status=$?

# The CLI saves the bundles that succeeded before exiting non-zero, so format
# them even after a partial failure.
yarn lint:fix || status=$((status == 0 ? $? : status))

exit "$status"
