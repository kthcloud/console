#!/usr/bin/env bun

import fs from "fs";
import path from "path";

// @ts-ignore
const viteEnv = import.meta.env;

// Get the filename from command-line arguments
const args = process.argv.slice(2);
const outputFilename = args[0] || ".env.docker"; // Default to `.env.docker` if no argument is provided

let envProductionContent = "";

// Process environment variables
for (const [key, _] of Object.entries(viteEnv)) {
  if (key.startsWith("VITE_")) {
    envProductionContent += `${key}={{__${key.slice("VITE_".length)}__}}\n`;
  }
}

// Resolve the output file path
const outputFilePath = path.resolve(outputFilename);

// Write the content to the specified file
fs.writeFileSync(outputFilePath, envProductionContent, "utf-8");

console.log(`${outputFilename} file created successfully!`);
