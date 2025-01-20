#!/usr/bin/env bun

import fs from "fs";
import path from "path";

const viteEnv = import.meta.env;

let entrypointScript = `#!/bin/bash

# Entrypoint script, replaces env variables in the dist files
set -eu

exec "$@"
  
# Function to update environment variables in files recursively
update_env_vars_placeholders() {
  local directory="$1"
  local old_var="$2"
  local new_value="\${!3:-}"

  if [[ -z "$new_value" && -n "$3" ]]; then
    echo "[WARN]: The value for $3 is not set." >&2
  fi

  # Find files in the given directory recursively
  find "$directory" -type f -exec sed -i "s|{{$old_var}}|$new_value|g" {} +
}\n\n`;

// Add the updates for all VITE_* env variables
for (const [key, _] of Object.entries(viteEnv)) {
  if (key.startsWith("VITE_")) {
    const env = key.slice("VITE_".length);
    entrypointScript += `update_env_vars_placeholders "/usr/share/nginx/html" "__${env}__" "${env}"\n`;
  }
}

// Start Nginx
entrypointScript += `\n# Start Nginx\nnginx -g 'daemon off;'`;

console.log(entrypointScript);

// Get the filename from command-line arguments
const args = process.argv.slice(2);
const outputFilename = args[0] || "entrypoint.sh"; // Default to entrypoint.sh if no argument is provided

// Define the output file path
const outputFilePath = path.resolve(outputFilename);

// Write the entrypoint script to the specified file
fs.writeFileSync(outputFilePath, entrypointScript, "utf-8");

// Set the file permissions to 777 (executable for all users)
fs.chmodSync(outputFilePath, 0o777);

console.log(
  `${outputFilename} file created with executable permissions (777)!`
);
