import crypto from "crypto";

/**
 * Performs two rounds of sha256 hashing
 * @param buf
 */
export function hash256(buf: Buffer): Buffer {
  return crypto
    .createHash("sha256")
    .update(crypto.createHash("sha256").update(buf).digest())
    .digest();
}
