/**
 * Contract audit. Run with `npm run contract:check`.
 *
 * Fails the build when the three things that must agree drift apart:
 *   1. ENDPOINT_CONTRACT.md   — what the backend team implements against
 *   2. src/lib/api/registry.ts — what the engineer dashboard renders
 *   3. @replace_with_real_API tags in src/lib/api/*.ts — what the UI actually calls
 *
 * Keeping these in sync by hand across a five-person team does not work, so this
 * script is the enforcement.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ENDPOINT_REGISTRY } from "../src/lib/api/registry";

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(here, "..");
const repoRoot = join(frontendRoot, "..");
const contractPath = join(repoRoot, "ENDPOINT_CONTRACT.md");

const METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE"] as const;
const norm = (method: string, path: string) => `${method.toUpperCase()} ${path.trim()}`;

const errors: string[] = [];
const warnings: string[] = [];

// --- 1. Parse the contract document ----------------------------------------
if (!existsSync(contractPath)) {
  console.error(`✗ ENDPOINT_CONTRACT.md not found at ${contractPath}`);
  process.exit(1);
}
const contract = readFileSync(contractPath, "utf8");
const contractEndpoints = new Set<string>();
for (const line of contract.split("\n")) {
  const m = line.match(/^\|\s*(GET|POST|PATCH|PUT|DELETE)\s*\|\s*([^|]+)\|/);
  if (m && m[1] && m[2]) contractEndpoints.add(norm(m[1], m[2]));
}

// --- 2. The registry --------------------------------------------------------
const registryEndpoints = new Set(ENDPOINT_REGISTRY.map((e) => norm(e.method, e.path)));

// --- 3. @replace_with_real_API tags across the API client -------------------
const taggedEndpoints = new Set<string>();
const apiDir = join(frontendRoot, "src", "lib", "api");
const walk = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
        d.isDirectory() ? walk(join(dir, d.name)) : d.name.endsWith(".ts") ? [join(dir, d.name)] : [],
      )
    : [];
for (const file of walk(apiDir)) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(/@replace_with_real_API\s+"([^"]+)"/g)) {
    const raw = m[1];
    if (!raw) continue;
    const parts = raw.trim().split(/\s+/);
    const [method, path] = parts;
    if (!method || !path || !METHODS.includes(method.toUpperCase() as (typeof METHODS)[number])) {
      errors.push(`Malformed tag in ${file}: @replace_with_real_API "${raw}" — expected "METHOD /path"`);
      continue;
    }
    taggedEndpoints.add(norm(method, path));
  }
}

// --- Compare ----------------------------------------------------------------
const diff = (a: Set<string>, b: Set<string>) => [...a].filter((x) => !b.has(x)).sort();

for (const e of diff(registryEndpoints, contractEndpoints))
  errors.push(`In registry.ts but NOT documented in ENDPOINT_CONTRACT.md: ${e}`);
for (const e of diff(contractEndpoints, registryEndpoints))
  errors.push(`Documented in ENDPOINT_CONTRACT.md but NOT in registry.ts: ${e}`);
for (const e of diff(taggedEndpoints, registryEndpoints))
  errors.push(`Tagged @replace_with_real_API but NOT in registry.ts: ${e}`);

// A registry row with no tag yet is expected while pages are still being built.
for (const e of diff(registryEndpoints, taggedEndpoints))
  warnings.push(`No @replace_with_real_API tag yet (page not built): ${e}`);

// --- Report -----------------------------------------------------------------
console.log(`Contract endpoints : ${contractEndpoints.size}`);
console.log(`Registry endpoints : ${registryEndpoints.size}`);
console.log(`Tagged API calls   : ${taggedEndpoints.size}`);
if (warnings.length) {
  console.log(`\n${warnings.length} endpoint(s) not yet wired into the UI:`);
  for (const w of warnings.slice(0, 10)) console.log(`  · ${w}`);
  if (warnings.length > 10) console.log(`  · …and ${warnings.length - 10} more`);
}
if (errors.length) {
  console.error(`\n✗ ${errors.length} contract mismatch(es):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("\n✓ Contract, registry and API client tags are in sync.");
