import { Readable } from "stream";
import { bigToBufLE } from "./BigIntUtil";

/**
 * Strips the left bytes if they match the provided value
 * @param val byte value
 */
export function lstrip(buf: Buffer, match: number) {
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] !== match) return Buffer.from(buf.slice(i));
    }
    return Buffer.alloc(0);
}

/**
 * Strips the right bytes if they match the provided match value
 * @param buf
 * @param match
 */
export function rstrip(buf: Buffer, match: number) {
    for (let i = buf.length - 1; i >= 0; i--) {
        if (buf[i] !== match) return Buffer.from(buf.slice(0, i + 1));
    }
    return Buffer.alloc(0);
}

/**
 * Combines buffers together in the provided order
 * @param buf
 */
export function combine(...buf: Buffer[]): Buffer {
    return Buffer.concat(buf);
}

/**
 * Combines numbers, bigints, and Buffers into a single byte stream
 * where numbers are in little-endian format
 * @param vals
 */
export function combineLE(...vals: (number | bigint | Buffer)[]): Buffer {
    const bufs: Buffer[] = [];
    for (const val of vals) {
        if (val instanceof Buffer) {
            bufs.push(val);
        } else {
            bufs.push(bigToBufLE(BigInt(val)));
        }
    }
    return Buffer.concat(bufs);
}

/**
 * Creates a readable stream
 * @param buf
 */
export function bufToStream(buf: Buffer, end: boolean = true): Readable {
    const stream = new Readable();
    stream.push(buf);
    stream.push(null); // end stream
    return stream;
}

/**
 * Write the bytes in the `from` buffer to the `to` buffer startg at the offset
 * in the `to` buffer.
 * @param from
 * @param to
 * @param offset
 */
export function writeBytes(from: Buffer, to: Buffer, offset: number = 0) {
    for (let i = 0; i < from.length; i++) {
        to.writeUInt8(from[i], offset);
        offset += 1;
    }
}

/**
 * Write the bytes in the `from` buffer to the `to` buffer in reverse order
 * starting at the provided offset of the `to` buffer.
 * @param from
 * @param to
 * @param offset
 */
export function writeBytesReverse(
    from: Buffer,
    to: Buffer,
    offset: number = 0
) {
    for (let i = from.length - 1; i >= 0; i--) {
        to.writeUInt8(from[i], offset);
        offset += 1;
    }
}

/**
 * Creates a stream from a hex string
 * @param hex
 */
export function streamFromHex(hex: string) {
    return bufToStream(Buffer.from(hex, "hex"));
}

/**
 * Performs a bytewise xor on the values and returns a new Buffer of the
 * same length. Buffers must be equal length.
 * @param a
 * @param b
 * @returns new buffer with bytewise xor of a and b
 */
export function xor(a: Buffer, b: Buffer) {
    // check for equal length
    if (a.length !== b.length) {
        throw new Error("requires equal length buffers");
    }

    // alloc a buffer of same length
    const result = Buffer.alloc(a.length);

    // copy xor values into result
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] ^ b[i];
    }

    return result;
}
