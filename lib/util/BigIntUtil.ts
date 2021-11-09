export function bigToBuf(num: bigint, len?: number): Buffer {
    let str = num.toString(16);
    if (len) str = str.padStart(len * 2, "0");
    else if (str.length % 2 === 1) str = "0" + str;
    return Buffer.from(str, "hex");
}

export function bigToBufLE(num: bigint, len?: number): Buffer {
    return bigToBuf(num, len).reverse();
}

export function bigFromBuf(buf: Buffer): bigint {
    return BigInt("0x" + buf.toString("hex"));
}

export function bigFromBufLE(buf: Buffer): bigint {
    return bigFromBuf(Buffer.from(buf).reverse());
}
