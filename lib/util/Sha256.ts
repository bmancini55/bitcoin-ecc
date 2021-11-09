import crypto from "crypto";

/**
 * Performs sha256 hashing
 * @param buf
 */
export function sha256(buf: Buffer): Buffer {
  return crypto.createHash("sha256").update(buf).digest();
}
