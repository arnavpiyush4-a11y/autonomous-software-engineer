/**
 * E-Commerce Platform — Dependency Analyzer
 * Safe read-only analysis of the fixture's package.json
 */

const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');

try {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const VULNERABLE = {
    'jsonwebtoken': { threshold: '9.0.0', cve: 'CVE-2022-23529', severity: 'CRITICAL', cvss: 7.6 },
    'lodash': { threshold: '4.17.21', cve: 'CVE-2021-23337', severity: 'HIGH', cvss: 7.2 },
    'axios': { threshold: '1.0.0', cve: 'CVE-2023-45857', severity: 'MEDIUM', cvss: 5.9 },
  };

  const findings = [];

  for (const [pkg, version] of Object.entries(deps)) {
    const vuln = VULNERABLE[pkg];
    if (vuln) {
      const clean = String(version).replace(/[\^~>=<]/g, '').split('.').map(Number);
      const thresh = vuln.threshold.split('.').map(Number);
      const isVuln = clean[0] < thresh[0] ||
        (clean[0] === thresh[0] && clean[1] < thresh[1]) ||
        (clean[0] === thresh[0] && clean[1] === thresh[1] && clean[2] < thresh[2]);
      if (isVuln) {
        findings.push({ pkg, version, ...vuln });
      }
    }
  }

  console.log(JSON.stringify({
    ok: true,
    totalDeps: Object.keys(deps).length,
    vulnerabilities: findings,
    analyzedAt: new Date().toISOString(),
  }, null, 2));

  process.exit(findings.some(f => f.severity === 'CRITICAL') ? 1 : 0);
} catch (e) {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
}
