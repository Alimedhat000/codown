/**
 * Reversible short-ID helpers: UUID <-> 22-char base64url.
 * UUID  -> 22-char opaque ID (e.g. VQ6EAOKbQdSnFkRmVUQAAA) for URLs.
 * Short -> UUID, throws on malformed input (caller maps to 404).
 */

/** Matches a canonical UUID v4 string. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Matches a 22-char base64url string (no padding). */
const SHORT_RE = /^[A-Za-z0-9_-]{22}$/;

/**
 * Encodes a UUID to a 22-character base64url short ID.
 * @param uuid - Canonical UUID string.
 * @returns 22-char base64url string with no padding.
 */
export function uuidToShortId(uuid: string): string {
  if (!UUID_RE.test(uuid)) {
    throw new Error(`Invalid UUID: ${uuid}`);
  }
  const hex = uuid.replace(/-/g, '');
  return Buffer.from(hex, 'hex').toString('base64url');
}

/**
 * Decodes a 22-character base64url short ID back to a UUID.
 * @param shortId - 22-char base64url string.
 * @returns Canonical UUID string.
 */
export function shortIdToUuid(shortId: string): string {
  if (!SHORT_RE.test(shortId)) {
    throw new Error(`Invalid short ID: ${shortId}`);
  }
  const hex = Buffer.from(shortId, 'base64url').toString('hex');
  if (hex.length !== 32) {
    throw new Error(`Invalid short ID: ${shortId}`);
  }
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
}

/**
 * Returns true when the value looks like a canonical UUID.
 * @param value - Candidate string.
 */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Returns true when the value looks like a 22-char short ID.
 * @param value - Candidate string.
 */
export function isShortId(value: string): boolean {
  return SHORT_RE.test(value);
}
