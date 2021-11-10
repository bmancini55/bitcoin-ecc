/**
 * Combines buffers together in the provided order
 * @param buf
 */
export function combine(...buf: Buffer[]): Buffer {
    return Buffer.concat(buf);
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
