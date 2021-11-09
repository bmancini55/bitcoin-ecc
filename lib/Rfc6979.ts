import crypto from "crypto";
import * as bigint from "./util/BigIntUtil";

export class Rfc6979 {
    /**
     * Deterministic k generation using RFC 6979. This method uses
     * the secret z to create a unique, deterministic k every time.
     * @param z
     */
    public static genK(secret: bigint, z: bigint, N: bigint): bigint {
        let k = Buffer.alloc(32, 0x00);
        let v = Buffer.alloc(32, 0x01);

        if (z > N) {
            z -= N;
        }

        const zbytes = bigint.bigToBuf(z);
        const sbytes = bigint.bigToBuf(secret);

        const h = "sha256";

        k = crypto
            .createHmac(h, k)
            .update(Buffer.concat([v, Buffer.from([0]), sbytes, zbytes]))
            .digest();
        v = crypto.createHmac(h, k).update(v).digest();
        k = crypto
            .createHmac(h, k)
            .update(Buffer.concat([v, Buffer.from([1]), sbytes, zbytes]))
            .digest();
        v = crypto.createHmac(h, k).update(v).digest();

        while (true) {
            v = crypto.createHmac(h, k).update(v).digest();
            const candidate = bigint.bigFromBuf(v);
            if (candidate >= 1n && candidate < N) {
                return candidate;
            }

            k = crypto
                .createHmac(h, k)
                .update(Buffer.concat([v, Buffer.from([0])]))
                .digest();
            v = crypto.createHmac(h, k).update(v).digest();
        }
    }
}
