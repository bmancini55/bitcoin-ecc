import { FieldValue } from "./FieldValue";
import { Point } from "./Point";
import { Rfc6979 } from "./Rfc6979";
import { Secp256k1 } from "./Secp256k1";
import { Signature } from "./Signature";
import { mod, pow } from "./util/BigIntMath";

export class Ecdsa {
    /**
     * Signs a message `z` using the provided `secret`.
     * @param secret
     * @param z
     */
    public static sign(secret: bigint, z: bigint): Signature {
        const k = Rfc6979.genK(secret, z, Secp256k1.N);
        const r = Secp256k1.G.smul(k).x.num;
        const kinv = pow(k, Secp256k1.N - 2n, Secp256k1.N);
        let s = mod((z + r * secret) * kinv, Secp256k1.N);
        if (s > Secp256k1.N / 2n) {
            s = Secp256k1.N - s;
        }
        return new Signature(r, s);
    }

    /**
     * Verifies a signature.
     *
     * The verification process is as follows:
     * We are provided (r,s) as the signature and z as the hash
     * of the thing being signed, and P as the public key (public point) of the signer.
     *
     * This calculates:
     *  `u = z/s`
     *  `v = r/s`
     *
     * We then calculate `uG + vP = R`
     * If `R's` `x` coordinate equals `r`, then signature is valid!
     *
     * Implementation notes:
     *  - `s_inv` is calculated using Fermat's Little Theorem to calculate `1/s` since `n` is prime.
     *  - `uG + vP = (r,y)` but we only care about r.
     *
     * @point point to verify
     * @param z hash of information that was signed
     * @param sig signature r,s
     */
    public static verify(
        point: Point<FieldValue>,
        z: bigint,
        sig: Signature
    ): boolean {
        const sinv = pow(sig.s, Secp256k1.N - 2n, Secp256k1.N);
        const u = mod(z * sinv, Secp256k1.N);
        const v = mod(sig.r * sinv, Secp256k1.N);
        const total = Secp256k1.G.smul(u).add(point.smul(v));
        return sig.r === total.x.num;
    }
}
