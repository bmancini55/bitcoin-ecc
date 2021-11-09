import { pow, mod } from "./util/BigIntMath";
import { Signature } from "./Signature";
import * as bigint from "./util/BigIntUtil";
import crypto from "crypto";
import { Secp256k1 } from "./Secp256k1";
import { FieldValue } from "./FieldValue";
import { Point } from "./Point";

export class S256Secret {
    public point: Point<FieldValue>;

    constructor(readonly secret: bigint) {
        this.point = Secp256k1.G.smul(secret);
    }

    public toString() {
        return `${this.secret.toString(16).padStart(64, "0")}`;
    }

    /**
     * Signs
     * @param z
     * @param k
     */
    public sign(z: bigint): Signature {
        const k = this.genK(z);
        const r = Secp256k1.G.smul(k).x.num;
        const kinv = pow(k, Secp256k1.N - 2n, Secp256k1.N);
        let s = mod((z + r * this.secret) * kinv, Secp256k1.N);
        if (s > Secp256k1.N / 2n) {
            s = Secp256k1.N - s;
        }
        return new Signature(r, s);
    }

    /**
     * Deterministic k generation using RFC 6979. This method uses
     * the secret z to create a unique, deterministic k every time.
     * @param z
     */
    public genK(z: bigint): bigint {
        let k = Buffer.alloc(32, 0x00);
        let v = Buffer.alloc(32, 0x01);

        if (z > Secp256k1.N) {
            z -= Secp256k1.N;
        }

        const zbytes = bigint.bigToBuf(z);
        const sbytes = bigint.bigToBuf(this.secret);

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
            if (candidate >= 1n && candidate < Secp256k1.N) {
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
