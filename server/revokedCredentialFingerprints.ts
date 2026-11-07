import { createHash } from 'node:crypto';

export function isUsableBotCredential(token: string, production = process.env.NODE_ENV === 'production'): boolean {
  if (!token || exposedBotCredentialFingerprints.has(createHash('sha256').update(token.trim()).digest('hex'))) return false;
  return !production || /^[0-9]{1,20}:[A-Za-z0-9_-]{30,128}$/.test(token);
}

// SHA-256 fingerprints of bot credentials exposed in historical tracked deployment documents.
// Credential values are never stored here. Reuse must fail closed even if an old deployment is restored.
export const exposedBotCredentialFingerprints = new Set<string>(["075d54069740d46728114eef717aec462235e7a2d27bcd5ea47024ea2d902269"]);
