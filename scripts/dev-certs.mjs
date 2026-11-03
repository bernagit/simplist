#!/usr/bin/env node
/**
 * HTTPS for local development (service workers and Web Push need a secure origin).
 * Creates a certificate signed by the local mkcert CA for localhost and this machine's LAN
 * address, so a phone on the same Wi-Fi can open https://<lan-ip>:3000 too.
 * Then run `yarn dev:https`.
 * A phone must also trust the mkcert CA: the script prints how.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { lanAddresses } from "./lan-addresses.mjs";

const OUT_DIR = "apps/app/certificates";
const CERT = join(OUT_DIR, "dev.pem");
const KEY = join(OUT_DIR, "dev-key.pem");

function mkcert(args) {
  return execFileSync("mkcert", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
}

let caRoot;
try {
  caRoot = mkcert(["-CAROOT"]).trim();
} catch {
  console.error("mkcert is not installed: https://github.com/FiloSottile/mkcert#installation");
  process.exit(1);
}

if (!existsSync(join(caRoot, "rootCA.pem"))) {
  console.error("No local CA yet. Run `mkcert -install` once (it asks for your password), then retry.");
  process.exit(1);
}

const hosts = ["localhost", "127.0.0.1", "::1", ...lanAddresses()];
mkdirSync(OUT_DIR, { recursive: true });
mkcert(["-cert-file", CERT, "-key-file", KEY, ...hosts]);

const lan = hosts.filter((host) => /^\d+\.\d+\.\d+\.\d+$/.test(host) && host !== "127.0.0.1");
console.log(`
Certificate for ${hosts.join(", ")} written to ${OUT_DIR}/ (git-ignored).

Start the app with:   yarn dev:https
Open:                 https://localhost:3000${lan.map((ip) => `\n                      https://${ip}:3000 (from a phone on the same network)`).join("")}

On a phone, trust the CA first (file: ${join(caRoot, "rootCA.pem")}):
  Android  Settings > Security > Encryption & credentials > Install a certificate > CA certificate
  iOS      send it to the phone, install the profile (Settings > Profile Downloaded), then enable it
           in Settings > General > About > Certificate Trust Settings.
           Push on iOS also needs the app added to the Home Screen.

Re-run this script if your LAN address changes.`);
