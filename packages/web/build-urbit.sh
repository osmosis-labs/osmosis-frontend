#! /usr/bin/env bash

# Replace filename references in build/out directory
find out -type f -name "*" -print0 | xargs -0 sed -i '' -e 's/_buildManifest.js/build-manifest.js/g'
find out -type f -name "*" -print0 | xargs -0 sed -i '' -e 's/_ssgManifest.js/ssg-manifest.js/g'

rename_file() {
  local directory="$1"
  local old_name="$2"
  local new_name="$3"

  # Loop through each matching file and rename
  for file in $(find "${directory}" -type f -name "*${old_name}"); do
    dir=$(dirname "${file}")
    base=$(basename "${file}")
    mv "${file}" "${dir}/${base//$old_name/$new_name}"
  done
}

static_directory='out/_next/static/'

# Rename _buildManifest.js to build-manifest.js
rename_file "${static_directory}" '_buildManifest.js' 'build-manifest.js'

# Rename _ssgManifest.js to ssg-manifest.js
rename_file "${static_directory}" '_ssgManifest.js' 'ssg-manifest.js'

# Sanitize js filenames for dynamic routes
sanitize_chunk_js_files() {
    local directory="$1"

    # Loop through each file matching the pattern in the subpath
    for file in $(find "${directory}" -type f -regex '.*\[[a-zA-Z0-9_-]*\]-[a-fA-F0-9]*\.js'); do
        dir=$(dirname "${file}")
        base=$(basename "${file}")

        # Extract the denom or id from the filename using regex
        if [[ "${base}" =~ \[([a-zA-Z0-9_-]*)\]-([a-fA-F0-9]*)\.js ]]; then
          new_name="_${BASH_REMATCH[1]}_-${BASH_REMATCH[2]}.js"
          mv "${file}" "${dir}/${new_name}"
        fi
    done
}

chunks_directory="${static_directory}/chunks"

# Sanitize chunk JS files
sanitize_chunk_js_files "${chunks_directory}"

# Update references for chunk js files of dynamic routes
update_chunk_references() {
  local directory="$1"

  # Loop through each file in the directory
  for file in $(find "${directory}" -type f); do
    if [[ -f "${file}" ]]; then
      # Update references using sed with extended regular expressions
      sed -i -E 's|\[([[:alnum:]_-]+)\]-([[:alnum:]]+\.js)|_\1_-\2|g' "${file}"
      sed -i -E 's|%5B([[:alnum:]_-]+)%5D-([[:alnum:]]+\.js)|_\1_-\2|g' "${file}"
    fi
  done
}

# Replace chunk filename references in static directory
update_chunk_references out
