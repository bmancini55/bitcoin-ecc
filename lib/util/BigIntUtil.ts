export function bigToBuf(num: bigint, len?: number): Buffer {
    let str = num.toString(16);
    if (len) str = str.padStart(len * 2, "0");
    else if (str.length % 2 === 1) str = "0" + str;
    return Buffer.from(str, "hex");
}

export function bigFromBuf(buf: Buffer): bigint {
    return BigInt("0x" + buf.toString("hex"));
}

export function bigToHex(value: bigint, bytes: number) {
    const result = value.toString(16);
    return result.padStart(bytes * 2, "0");
}
