import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Dependency Security Scanning Script
 *
 * Runs:
 * 1. npm audit — fails on HIGH/CRITICAL vulnerabilities
 * 2. Detects hardcoded secrets (API keys, passwords) in source files
 * 3. Checks for outdated dependencies
 * 4. Writes a scan report to .reports/dependency-scan.json
 */

const REPORT_DIR = path.join(process.cwd(), ".reports");
const REPORT_FILE = path.join(REPORT_DIR, "dependency-scan.json");

const HARDCODED_SECRET_PATTERNS = [
  { name: "ImgBB API Key (hardcoded)", pattern: /['"]([\da-f]{32,64})['"]/gi },
  { name: "Password literal", pattern: /password\s*[:=]\s*['"][^'"]{6,}['"]/gi },
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/g },
  { name: "Generic secret", pattern: /secret\s*[:=]\s*['"][^'"]{8,}['"]/gi },
];

const SOURCE_DIRS = ["src", "scripts"];
const SCAN_EXTENSIONS = [".ts", ".tsx", ".js", ".json"];

// Allowlisted patterns that are false-positive safe (env vars, placeholders, etc.)
const ALLOWLIST = [
  /process\.env\./,
  /import\.meta\.env\./,
  /VITE_/,
  /\*{3,}/, // redacted placeholders
  /your[_-]?api[_-]?key/i,
  /placeholder/i,
  /example/i,
  /YOUR_SECRET/i,
];

interface ScanResult {
  timestamp: string;
  npmAudit: { passed: boolean; summary: string };
  secretScan: { passed: boolean; findings: string[] };
  outdated: { checked: boolean; summary: string };
}

function getAllSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllSourceFiles(fullPath));
    } else if (SCAN_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

async function runDependencyScan(): Promise<void> {
  console.log("🔍 aMenuVerse — Dependency & Secret Security Scan\n");

  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

  const result: ScanResult = {
    timestamp: new Date().toISOString(),
    npmAudit: { passed: false, summary: "" },
    secretScan: { passed: false, findings: [] },
    outdated: { checked: false, summary: "" },
  };

  // ─── 1. npm audit ───────────────────────────────────────────────────────────
  console.log("📦 Step 1: Running npm audit (HIGH/CRITICAL threshold)...");
  try {
    const auditOutput = execSync("npm audit --audit-level=high --json", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const auditJson = JSON.parse(auditOutput);
    const { high = 0, critical = 0 } = auditJson.metadata?.vulnerabilities ?? {};
    if (high > 0 || critical > 0) {
      result.npmAudit.summary = `❌ ${critical} critical, ${high} high vulnerabilities found`;
      result.npmAudit.passed = false;
      console.error(`   ${result.npmAudit.summary}`);
    } else {
      result.npmAudit.summary = "✅ No high/critical vulnerabilities found";
      result.npmAudit.passed = true;
      console.log(`   ${result.npmAudit.summary}`);
    }
  } catch (err: unknown) {
    // npm audit exits non-zero when vulnerabilities exist; parse the output anyway
    const errWithStdout = err as { stdout?: string; message?: string };
    if (errWithStdout?.stdout) {
      try {
        const auditJson = JSON.parse(errWithStdout.stdout);
        const { high = 0, critical = 0 } = auditJson.metadata?.vulnerabilities ?? {};
        result.npmAudit.summary = `❌ ${critical} critical, ${high} high vulnerabilities found`;
        result.npmAudit.passed = false;
        console.error(`   ${result.npmAudit.summary}`);
      } catch {
        result.npmAudit.summary = `⚠️ npm audit parse error: ${errWithStdout.message ?? "unknown"}`;
        result.npmAudit.passed = false;
        console.warn(`   ${result.npmAudit.summary}`);
      }
    } else {
      result.npmAudit.summary = `⚠️ npm audit error: ${(err as Error).message}`;
      result.npmAudit.passed = false;
      console.warn(`   ${result.npmAudit.summary}`);
    }
  }

  // ─── 2. Hardcoded secrets scan ──────────────────────────────────────────────
  console.log("\n🔐 Step 2: Scanning source files for hardcoded secrets...");
  const allFiles = SOURCE_DIRS.flatMap((d) => getAllSourceFiles(path.join(process.cwd(), d)));
  const findings: string[] = [];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, "utf8");
    const relPath = path.relative(process.cwd(), file);
    for (const { name, pattern } of HARDCODED_SECRET_PATTERNS) {
      const matches = content.matchAll(new RegExp(pattern.source, pattern.flags));
      for (const match of matches) {
        const lineNo = content.slice(0, match.index).split("\n").length;
        const line = content.split("\n")[lineNo - 1]?.trim() ?? "";
        // Skip allowlisted lines
        if (ALLOWLIST.some((allow) => allow.test(line))) continue;
        findings.push(`${relPath}:${lineNo} [${name}] → ${line.slice(0, 80)}`);
      }
    }
  }

  if (findings.length > 0) {
    result.secretScan.passed = false;
    result.secretScan.findings = findings;
    console.error(`   ❌ ${findings.length} potential hardcoded secret(s) found:`);
    for (const f of findings) console.error(`      ${f}`);
  } else {
    result.secretScan.passed = true;
    result.secretScan.findings = [];
    console.log(`   ✅ No hardcoded secrets detected across ${allFiles.length} source files`);
  }

  // ─── 3. Outdated check (informational only, does not fail CI) ───────────────
  console.log("\n📅 Step 3: Checking for outdated dependencies (informational)...");
  try {
    execSync("npm outdated --json", { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
    result.outdated = { checked: true, summary: "✅ All dependencies are up to date" };
    console.log(`   ${result.outdated.summary}`);
  } catch (err: unknown) {
    const errWithStdout = err as { stdout?: string };
    if (errWithStdout?.stdout) {
      try {
        const outdatedJson = JSON.parse(errWithStdout.stdout);
        const count = Object.keys(outdatedJson).length;
        result.outdated = {
          checked: true,
          summary: `ℹ️ ${count} outdated package(s) — review .reports/dependency-scan.json`,
        };
        console.log(`   ${result.outdated.summary}`);
      } catch {
        result.outdated = { checked: true, summary: "⚠️ Could not parse outdated output" };
      }
    } else {
      result.outdated = { checked: false, summary: "⚠️ npm outdated check skipped" };
      console.warn("   ⚠️ npm outdated check skipped");
    }
  }

  // ─── Write report ──────────────────────────────────────────────────────────
  fs.writeFileSync(REPORT_FILE, JSON.stringify(result, null, 2), "utf8");
  console.log(`\n📄 Scan report written → ${REPORT_FILE}`);

  // ─── Final pass/fail ───────────────────────────────────────────────────────
  const failed = !result.npmAudit.passed || !result.secretScan.passed;
  if (failed) {
    console.error("\n❌ Dependency scan FAILED — see findings above");
    process.exit(1);
  } else {
    console.log("\n✅ Dependency scan PASSED cleanly");
  }
}

runDependencyScan().catch((err: unknown) => {
  console.error("❌ Dependency scan script crashed:", (err as Error).message);
  process.exit(1);
});
