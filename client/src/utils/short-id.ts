/**
 * Reversible short-ID helpers: UUID <-> 22-char base64url.
 * Client-side implementation without Node Buffer.
 */

/** Matches a canonical UUID. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  const bytes = hexToBytes(hex);
  return bytesToBase64Url(bytes);
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
  const bytes = base64UrlToBytes(shortId);
  const hex = bytesToHex(bytes);
  if (hex.length !== 32) {
    throw new Error(`Invalid short ID: ${shortId}`);
  }
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
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

/**
 * Resolves a route param that may be either a UUID or a short ID to a UUID.
 * Throws when the input matches neither format (caller should map to 404).
 * @param rawId - Raw `:id` param from the route.
 * @returns Canonical UUID string.
 */
export function resolveDocumentId(rawId: string): string {
  if (isUuid(rawId)) return rawId.toLowerCase();
  if (isShortId(rawId)) return shortIdToUuid(rawId);
  throw new Error(`Invalid document ID: ${rawId}`);
}

/** Converts a hex string to bytes. */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/** Converts bytes to a hex string. */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Encodes bytes to base64url without padding. */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  // btoa is available in browsers; in Node tests it may not be — fallback to Buffer is not needed in client.
  const base64 =
    typeof btoa !== 'undefined'
      ? btoa(binary)
      : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** Decodes base64url to bytes. */
function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  const binary =
    typeof atob !== 'undefined'
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
