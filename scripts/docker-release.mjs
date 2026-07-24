#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const REGISTRY = "ghcr.io/bernagit";
const APPS = ["api", "app"];

// reading from api/package.json is safe.
const version = JSON.parse(readFileSync("apps/api/package.json", "utf8")).version;

const mode = process.argv[2]; // "build" | "push" | "release"
if (!["build", "push", "release"].includes(mode)) {
  console.error("Usage: node scripts/docker-release.mjs <build|push|release>");
  process.exit(1);
}

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

for (const app of APPS) {
  const image = `${REGISTRY}/simplist-${app}`;

  if (mode === "build" || mode === "release") {
    run(
      `docker build --no-cache -f apps/${app}/Dockerfile -t ${image}:${version} -t ${image}:latest .`
    );
  }

  if (mode === "push" || mode === "release") {
    run(`docker push ${image}:${version}`);
    run(`docker push ${image}:latest`);
  }
}

console.log(`\n✅ Done (${mode}) — version ${version}`);