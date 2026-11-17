// Baut das Dashboard (src/) zu einer Datei, die Home Assistant direkt laedt.
//   npm run build  -> custom_components/heizungsanalyse/www/heizungsanalyse-card.js
//   npm run check  -> nur pruefen (Syntax, Version), nichts schreiben
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const manifest = JSON.parse(readFileSync(resolve(root, "custom_components/heizungsanalyse/manifest.json"), "utf8"));
const outfile = resolve(root, "custom_components/heizungsanalyse/www/heizungsanalyse-card.js");
const versionFile = resolve(here, "src/version.js");
const check = process.argv.includes("--check");

const versionSrc = `// Wird von build.mjs aus der manifest.json gesetzt - nicht von Hand aendern\nexport const HA_VERSION = "${manifest.version}";\n`;
if (readFileSync(versionFile, "utf8") !== versionSrc) {
  if (check) {
    console.error(`src/version.js passt nicht zur manifest.json (${manifest.version}) - npm run build ausfuehren`);
    process.exit(1);
  }
  writeFileSync(versionFile, versionSrc);
}

await esbuild.build({
  entryPoints: [resolve(here, "src/index.js")],
  bundle: true,
  format: "iife",
  target: ["es2022"],
  legalComments: "none",
  charset: "utf8",
  minify: false,
  banner: { js: `/* Heizungsanalyse ${manifest.version} - gebaut aus frontend/src (npm run build). Nicht von Hand bearbeiten. */` },
  outfile: check ? undefined : outfile,
  write: !check,
  logLevel: "info",
});
