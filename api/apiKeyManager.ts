/**
 * ApiKeyManager — Round Robin + Failover + Adaptive Cooldown for Gemini API Keys
 * 
 * Features:
 * 1. True Round Robin across healthy keys using a persistent cursor.
 * 2. Failover: Automatic fallback to next healthy key when key-level failure occurs.
 * 3. Adaptive Cooldown: Error classification with exponential backoff & jitter.
 * 4. Key safety: Never logs or returns raw API keys.
 */

export type GeminiErrorType =
  | 'RATE_LIMIT'     // 429, RESOURCE_EXHAUSTED
  | 'UNAVAILABLE'    // 503, service unavailable
  | 'SERVER_ERROR'   // 500, 502, 504, transient internal error
  | 'TIMEOUT'        // request/fetch timeout
  | 'NETWORK_ERROR'  // socket/connection failure
  | 'AUTH_ERROR'     // 401, 403, invalid key
  | 'APP_ERROR'      // 400, bad request, validation error (not key's fault)
  | 'UNKNOWN';

export interface ManagedKey {
  id: string;              // Unique key ID e.g. "server:1", "visitor:1"
  key: string;             // Raw API key
  type: 'env' | 'visitor';
  index: number;           // 1-based index per type
  masked: string;          // Safe display label e.g. "Server Key #1 (AIza...4X9Z)"
  consecutiveFailures: number;
  totalFailures: number;
  lastUsedAt: number | null;
  lastSuccessAt: number | null;
  cooldownUntil: number;   // Timestamp (ms)
  lastErrorType: GeminiErrorType | null;
  status: 'healthy' | 'cooldown' | 'disabled';
}

export function maskKey(key: string): string {
  if (!key) return '(empty)';
  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return `${trimmed.substring(0, 2)}...${trimmed.substring(trimmed.length - 2)}`;
  }
  return `${trimmed.substring(0, 4)}...${trimmed.substring(trimmed.length - 4)}`;
}

export function classifyGeminiError(error: any): GeminiErrorType {
  const msg = (error?.message || String(error)).toLowerCase();
  const status = error?.status || error?.response?.status;

  if (
    status === 401 ||
    status === 403 ||
    msg.includes('api_key_invalid') ||
    msg.includes('unauthorized') ||
    msg.includes('permission_denied') ||
    msg.includes('api key not valid')
  ) {
    return 'AUTH_ERROR';
  }
  if (
    status === 429 ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded') ||
    msg.includes('rate limit') ||
    msg.includes('429')
  ) {
    return 'RATE_LIMIT';
  }
  if (
    status === 503 ||
    msg.includes('unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('503')
  ) {
    return 'UNAVAILABLE';
  }
  if (
    status === 500 ||
    status === 502 ||
    status === 504 ||
    msg.includes('500') ||
    msg.includes('internal server error')
  ) {
    return 'SERVER_ERROR';
  }
  if (
    msg.includes('timeout') ||
    msg.includes('etimedout') ||
    msg.includes('deadline_exceeded')
  ) {
    return 'TIMEOUT';
  }
  if (
    msg.includes('fetch failed') ||
    msg.includes('econnreset') ||
    msg.includes('network error') ||
    msg.includes('enotfound')
  ) {
    return 'NETWORK_ERROR';
  }
  if (
    status === 400 ||
    msg.includes('invalid_argument') ||
    msg.includes('bad request') ||
    msg.includes('prompt')
  ) {
    return 'APP_ERROR';
  }
  return 'UNKNOWN';
}

const BASE_COOLDOWNS: Record<GeminiErrorType, number> = {
  RATE_LIMIT: 30 * 1000,    // 30s base
  UNAVAILABLE: 10 * 1000,   // 10s base
  SERVER_ERROR: 10 * 1000,  // 10s base
  TIMEOUT: 10 * 1000,       // 10s base
  NETWORK_ERROR: 10 * 1000, // 10s base
  AUTH_ERROR: 3600 * 1000,  // 1 hour / disabled
  APP_ERROR: 0,             // No penalization
  UNKNOWN: 10 * 1000,
};

const MAX_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes max cap

export function calculateCooldown(errorType: GeminiErrorType, consecutiveFailures: number): number {
  const base = BASE_COOLDOWNS[errorType] ?? 10000;
  if (base === 0) return 0;
  const exponent = Math.max(0, consecutiveFailures - 1);
  const exponential = base * Math.pow(2, exponent);
  const capped = Math.min(exponential, MAX_COOLDOWN_MS);
  const jitter = Math.floor(Math.random() * 2000); // 0-2s jitter
  return capped + jitter;
}

class ApiKeyManager {
  private keysMap = new Map<string, ManagedKey>();
  private cursor = 0;

  /**
   * Sync keys with incoming server and visitor keys, preserving status/failure counts
   */
  public registerKeys(serverKeys: string[], visitorKeys: string[]): ManagedKey[] {
    const activeIds = new Set<string>();
    const registered: ManagedKey[] = [];

    // Process server keys
    serverKeys.forEach((key, idx) => {
      const id = `server:${idx + 1}:${key}`;
      activeIds.add(id);
      let existing = this.keysMap.get(id);
      if (!existing) {
        existing = {
          id,
          key,
          type: 'env',
          index: idx + 1,
          masked: `Kunci Server #${idx + 1} (${maskKey(key)})`,
          consecutiveFailures: 0,
          totalFailures: 0,
          lastUsedAt: null,
          lastSuccessAt: null,
          cooldownUntil: 0,
          lastErrorType: null,
          status: 'healthy',
        };
        this.keysMap.set(id, existing);
      }
      registered.push(existing);
    });

    // Process visitor keys
    visitorKeys.forEach((key, idx) => {
      const id = `visitor:${idx + 1}:${key}`;
      activeIds.add(id);
      let existing = this.keysMap.get(id);
      if (!existing) {
        existing = {
          id,
          key,
          type: 'visitor',
          index: idx + 1,
          masked: `Kunci Pengunjung #${idx + 1} (${maskKey(key)})`,
          consecutiveFailures: 0,
          totalFailures: 0,
          lastUsedAt: null,
          lastSuccessAt: null,
          cooldownUntil: 0,
          lastErrorType: null,
          status: 'healthy',
        };
        this.keysMap.set(id, existing);
      }
      registered.push(existing);
    });

    // Clean up stale keys no longer in active input
    for (const id of Array.from(this.keysMap.keys())) {
      if (!activeIds.has(id)) {
        this.keysMap.delete(id);
      }
    }

    return registered;
  }

  /**
   * Get candidate keys sorted by Round Robin cursor order, skipping keys currently in cooldown.
   * Auto-recovers keys whose cooldown has expired.
   */
  public getCandidateKeys(pool: ManagedKey[]): ManagedKey[] {
    const now = Date.now();

    // Refresh cooldown statuses
    for (const k of pool) {
      if (k.status === 'cooldown' && k.cooldownUntil <= now) {
        k.status = 'healthy';
        k.cooldownUntil = 0;
        console.log(`[API-KEY-MANAGER] [RECOVERY] ${k.masked} telah menyelesaikan masa cooldown dan kembali SEHAT.`);
      }
    }

    // Filter available (healthy) keys
    const available = pool.filter(k => k.status === 'healthy');

    if (available.length === 0) {
      return [];
    }

    // Apply Round Robin distribution starting from cursor
    const ordered: ManagedKey[] = [];
    const startIndex = this.cursor % available.length;

    for (let i = 0; i < available.length; i++) {
      const idx = (startIndex + i) % available.length;
      ordered.push(available[idx]);
    }

    // Advance cursor for next request
    this.cursor = (this.cursor + 1) % Math.max(1, available.length);

    return ordered;
  }

  /**
   * Mark key execution as successful
   */
  public markSuccess(keyId: string): void {
    const k = this.keysMap.get(keyId);
    if (!k) return;

    k.consecutiveFailures = 0;
    k.cooldownUntil = 0;
    k.status = 'healthy';
    k.lastSuccessAt = Date.now();
    k.lastUsedAt = Date.now();
    console.log(`[API-KEY-MANAGER] [SUCCESS] ${k.masked} berhasil digunakan. Counter kegagalan di-reset.`);
  }

  /**
   * Mark key execution as failed and calculate adaptive cooldown
   */
  public markFailure(keyId: string, error: any): GeminiErrorType {
    const k = this.keysMap.get(keyId);
    const errorType = classifyGeminiError(error);

    if (!k) return errorType;

    k.lastUsedAt = Date.now();
    k.lastErrorType = errorType;

    // Do NOT penalize key if the error is caused by application/client request payload
    if (errorType === 'APP_ERROR') {
      console.warn(`[API-KEY-MANAGER] [APP_ERROR] ${k.masked} mengalami error request aplikasi (400 Bad Request). Key tidak masuk cooldown.`);
      return errorType;
    }

    k.consecutiveFailures += 1;
    k.totalFailures += 1;

    if (errorType === 'AUTH_ERROR') {
      k.status = 'disabled';
      k.cooldownUntil = Date.now() + 3600 * 1000; // 1 hour
      console.error(`[API-KEY-MANAGER] [AUTH_ERROR] ${k.masked} tidak valid atau tidak memiliki akses (401/403). Status diubah ke DISABLED.`);
      return errorType;
    }

    const cooldownMs = calculateCooldown(errorType, k.consecutiveFailures);
    k.cooldownUntil = Date.now() + cooldownMs;
    k.status = 'cooldown';

    const cooldownSec = Math.ceil(cooldownMs / 1000);
    console.warn(`[API-KEY-MANAGER] [COOLDOWN] ${k.masked} gagal (${errorType}, percobaan berturut-turut #${k.consecutiveFailures}). Masuk COOLDOWN selama ${cooldownSec}s.`);

    return errorType;
  }

  /**
   * Get safe summary for status inspection
   */
  public getStatusSummary(): Array<{
    id: string;
    masked: string;
    type: string;
    index: number;
    status: string;
    consecutiveFailures: number;
    cooldownRemainingSec: number;
  }> {
    const now = Date.now();
    return Array.from(this.keysMap.values()).map(k => ({
      id: k.id,
      masked: k.masked,
      type: k.type,
      index: k.index,
      status: k.status === 'cooldown' && k.cooldownUntil <= now ? 'healthy' : k.status,
      consecutiveFailures: k.consecutiveFailures,
      cooldownRemainingSec: k.cooldownUntil > now ? Math.ceil((k.cooldownUntil - now) / 1000) : 0,
    }));
  }
}

export const apiKeyManager = new ApiKeyManager();
