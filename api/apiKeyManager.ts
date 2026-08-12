/**
 * ApiKeyManager — Unified API Key Pool with True Round Robin, Failover, and Adaptive Cooldown
 * 
 * Features:
 * 1. Single Visitor Key Pool (No Server Key concepts).
 * 2. Safe IDs & Label Masking (Raw credentials are never in IDs or logs).
 * 3. True Round Robin across healthy keys via a persistent cursor.
 * 4. Separate Model Errors vs Key Errors (Model fallback attempted before key failover).
 * 5. Adaptive Cooldown with Exponential Backoff + Jitter.
 * 6. Permanent Disable for AUTH_ERROR (401/403/invalid key).
 * 7. Reset Health on Success.
 */

export type GeminiErrorType =
  | 'RATE_LIMIT'     // 429, RESOURCE_EXHAUSTED
  | 'UNAVAILABLE'    // 503, service unavailable / overloaded
  | 'SERVER_ERROR'   // 500, 502, 504, transient internal error
  | 'TIMEOUT'        // request/fetch timeout
  | 'NETWORK_ERROR'  // socket/connection failure
  | 'AUTH_ERROR'     // 401, 403, invalid key
  | 'APP_ERROR'      // 400, bad request, validation error (client payload issue)
  | 'UNKNOWN';

export interface ManagedKey {
  id: string;              // Safe ID e.g. "api-key-1", "api-key-2"
  key: string;             // Raw API key (used internally only)
  index: number;           // 1-based index
  masked: string;          // Safe display label e.g. "API Key #1 (AIza...4X9Z)"
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
  AUTH_ERROR: 24 * 3600 * 1000, // Disabled permanently unless re-registered
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
   * Synchronize active key pool while preserving failure counters and cooldown state.
   */
  public registerKeys(rawKeys: string[]): ManagedKey[] {
    const activeKeysMap = new Map<string, string>(); // rawKey -> safeId
    const registered: ManagedKey[] = [];

    // Deduplicate and filter non-empty keys
    const uniqueKeys = Array.from(new Set(rawKeys.map(k => k.trim()).filter(Boolean)));

    uniqueKeys.forEach((key, idx) => {
      const id = `api-key-${idx + 1}`;
      activeKeysMap.set(key, id);

      // Search if this exact raw key already exists under any ID
      let existing: ManagedKey | undefined = undefined;
      for (const item of Array.from(this.keysMap.values())) {
        if (item.key === key) {
          existing = item;
          break;
        }
      }

      if (!existing) {
        existing = {
          id,
          key,
          index: idx + 1,
          masked: `API Key #${idx + 1} (${maskKey(key)})`,
          consecutiveFailures: 0,
          totalFailures: 0,
          lastUsedAt: null,
          lastSuccessAt: null,
          cooldownUntil: 0,
          lastErrorType: null,
          status: 'healthy',
        };
      } else {
        // Update index & display label for existing key
        existing.id = id;
        existing.index = idx + 1;
        existing.masked = `API Key #${idx + 1} (${maskKey(key)})`;
      }

      this.keysMap.set(id, existing);
      registered.push(existing);
    });

    // Remove keys no longer present in current registration
    for (const [id, item] of Array.from(this.keysMap.entries())) {
      if (!uniqueKeys.includes(item.key)) {
        this.keysMap.delete(id);
      }
    }

    return registered;
  }

  /**
   * Get candidate keys sorted by Round Robin cursor order, skipping keys currently in cooldown or disabled.
   * Automatically recovers keys whose cooldown period has expired.
   */
  public getCandidateKeys(pool: ManagedKey[]): ManagedKey[] {
    const now = Date.now();

    // Refresh cooldown statuses for keys in pool
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

    // Order starting from cursor position
    const ordered: ManagedKey[] = [];
    const startIndex = this.cursor % available.length;

    for (let i = 0; i < available.length; i++) {
      const idx = (startIndex + i) % available.length;
      ordered.push(available[idx]);
    }

    // Advance cursor for next Round Robin selection
    this.cursor = (this.cursor + 1) % Math.max(1, available.length);

    return ordered;
  }

  /**
   * Mark key execution as successful, resetting failure counters and setting status to healthy.
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
   * Mark key execution as failed and calculate adaptive cooldown or disable status.
   */
  public markFailure(keyId: string, error: any): GeminiErrorType {
    const k = this.keysMap.get(keyId);
    const errorType = classifyGeminiError(error);

    if (!k) return errorType;

    k.lastUsedAt = Date.now();
    k.lastErrorType = errorType;

    // Do NOT penalize key if the error is caused by application/client request payload (400 Bad Request)
    if (errorType === 'APP_ERROR') {
      console.warn(`[API-KEY-MANAGER] [APP_ERROR] ${k.masked} mengalami error request aplikasi (400 Bad Request). Key tidak masuk cooldown.`);
      return errorType;
    }

    k.consecutiveFailures += 1;
    k.totalFailures += 1;

    if (errorType === 'AUTH_ERROR') {
      k.status = 'disabled';
      k.cooldownUntil = Date.now() + 365 * 24 * 3600 * 1000; // Permanently disabled
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
   * Get safe summary for status inspection without exposing raw credentials.
   */
  public getStatusSummary(): Array<{
    id: string;
    masked: string;
    index: number;
    status: string;
    consecutiveFailures: number;
    cooldownRemainingSec: number;
  }> {
    const now = Date.now();
    return Array.from(this.keysMap.values()).map(k => ({
      id: k.id,
      masked: k.masked,
      index: k.index,
      status: k.status === 'cooldown' && k.cooldownUntil <= now ? 'healthy' : k.status,
      consecutiveFailures: k.consecutiveFailures,
      cooldownRemainingSec: k.cooldownUntil > now ? Math.ceil((k.cooldownUntil - now) / 1000) : 0,
    }));
  }
}

export const apiKeyManager = new ApiKeyManager();
