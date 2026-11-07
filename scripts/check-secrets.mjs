import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

// Fast pre-commit/CI guard. Reports locations only; never prints credential material.
// Provider-side secret scanning and rotation are still required for historic exposure.
const paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const patterns = [
  /\d{5,15}:[A-Za-z0-9_-]{30,}/g,
  /\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
  /\bAKIA[A-Z0-9]{16}\b/g,
  /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/g,
];
let failures = 0;
for (const file of paths) {
  if (!existsSync(file) || !/\.(?:[cm]?[jt]sx?|json|md|txt|ya?ml|toml|html|env|sh|ps1)$/i.test(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) {
      const line = content.slice(0, match.index).split('\n').length;
      console.error(`Potential credential: ${file}:${line}`);
      failures++;
    }
  }
}
if (failures) { console.error(`Secret check failed: ${failures} potential credentials. Revoke exposed credentials and remove them from source.`); process.exitCode = 1; }
else console.log('Secret check passed for the currently tracked files.');
