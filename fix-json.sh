#!/bin/bash

# Define the directory to search for JSON files
json_files_path="packages/web/localizations"

# Iterate through each JSON file in the specified directory and its subdirectories
find "$json_files_path" -type f -name "*.json" | while IFS= read -r file; do
    fixed_json=$(jq -n --argjson value "$(cat "$file" 2>/dev/null)" '{clPositions: $value}' 2>/dev/null)

    # Check if there was an error with the JSON parsing
    if [[ $? -ne 0 ]]; then
        echo "Error parsing JSON file: $file"
        echo "$fixed_json"
        continue
    fi

    # Overwrite the file with the fixed JSON
    echo "$fixed_json" >"$file"
done
