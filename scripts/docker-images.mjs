#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const REGISTRY = "ghcr.io/bernagit";
const APPS = ["api", "app"];

const VERSION = JSON.parse(
  readFileSync("apps/api/package.json", "utf8"),
).version;

const MODES = new Set(["build", "push", "release"]);
const mode = process.argv[2];

if (!MODES.has(mode)) {
  console.error(
    `Usage: node scripts/docker-images.mjs <${[...MODES].join("|")}>`,
  );
  process.exit(1);
}

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, {
    stdio: "inherit",
  });
}

for (const app of APPS) {
  const image = `${REGISTRY}/simplist-${app}`;

  switch (mode) {
    case "build":
      run(
        `docker build --no-cache \
-f apps/${app}/Dockerfile \
-t ${image}:${VERSION} \
-t ${image}:latest .`,
      );
      break;

    case "push":
      run(`docker push ${image}:${VERSION}`);
      run(`docker push ${image}:latest`);
      break;

    case "release":
      run(
        `docker build --no-cache \
-f apps/${app}/Dockerfile \
-t ${image}:${VERSION} \
-t ${image}:latest .`,
      );
      run(`docker push ${image}:${VERSION}`);
      run(`docker push ${image}:latest`);
      break;
  }
}

console.log(`\n✅ Docker image ${mode} completed (version ${VERSION})`);