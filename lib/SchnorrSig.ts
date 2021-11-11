import { bigFromBuf, bigToBuf } from "./util/BigIntUtil";

export class SchnorrSig {
    public static fromBuf(buf: Buffer) {
        if (buf.length !== 64) {
            throw new Error("Invalid signature");
        }

        const r = bigFromBuf(buf.slice(0, 32));
        const s = bigFromBuf(buf.slice(32));
        return new SchnorrSig(r, s);
    }

    constructor(readonly r: bigint, readonly s: bigint) {}

    public toBuffer(): Buffer {
        const result = Buffer.alloc(64);
        bigToBuf(this.r, 32).copy(result, 0);
        bigToBuf(this.s, 32).copy(result, 32);
        return result;
    }
}
