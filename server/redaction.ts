export function redactSensitiveText(value: string): string {
  return value.replace(/\d{5,15}:[A-Za-z0-9_-]{30,}/g, '[REDACTED_BOT_TOKEN]')
    .replace(/\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]+/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/\bsk_(?:live|test)_[A-Za-z0-9]+/g, '[REDACTED_PAYMENT_KEY]')
    .replace(/\bAIza[A-Za-z0-9_-]{30,}/g, '[REDACTED_PROVIDER_KEY]')
    .replace(/(Bearer\s+)[^\s"']+/gi, '$1[REDACTED]');
}

// Also covers tracing spans and breadcrumbs, where outbound bot URLs may contain a credential.
export function redactMonitoringEvent<T>(event: T): T {
  const seen = new WeakSet<object>();
  const walk = (value: unknown, key = '', depth = 0): unknown => {
    if (/authorization|cookie|init.?data|csrf|password|secret|(?:api|bot).?key|bot.?token/i.test(key)) return '[REDACTED]';
    if (typeof value === 'string') return redactSensitiveText(/url$/i.test(key) ? value.split('?')[0] : value);
    if (!value || typeof value !== 'object') return value;
    if (depth > 30 || seen.has(value)) return '[OMITTED]';
    seen.add(value);
    if (Array.isArray(value)) return value.map(item => walk(item, '', depth + 1));
    const result: Record<string, unknown> = Object.create(null);
    for (const [childKey, item] of Object.entries(value)) result[childKey] = walk(item, childKey, depth + 1);
    return result;
  };
  return walk(event) as T;
}
