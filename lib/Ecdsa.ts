import { Rfc6979 } from "./Rfc6979";
import { CurveSecp256k1 } from "./Secp256k1";
import { EcdsaSig } from "./EcdsaSig";
import { mod, pow } from "./util/BigIntMath";
import { CurvePoint } from "./CurvePoint";

export class Ecdsa {
    /**
     * Signs a message `z` using the provided `secret`.
     * @param secret
     * @param z
     */
    public static sign(secret: bigint, z: bigint): EcdsaSig {
        const k = Rfc6979.genK(secret, z, CurveSecp256k1.N);
        const r = CurveSecp256k1.G.smul(k).x;
        const kinv = pow(k, CurveSecp256k1.N - 2n, CurveSecp256k1.N);
        let s = mod((z + r * secret) * kinv, CurveSecp256k1.N);
        if (s > CurveSecp256k1.N / 2n) {
            s = CurveSecp256k1.N - s;
        }
        return new EcdsaSig(r, s);
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
    public static verify(point: CurvePoint, z: bigint, sig: EcdsaSig): boolean {
        const sinv = pow(sig.s, CurveSecp256k1.N - 2n, CurveSecp256k1.N);
        const u = mod(z * sinv, CurveSecp256k1.N);
        const v = mod(sig.r * sinv, CurveSecp256k1.N);
        const total = CurveSecp256k1.G.smul(u).add(point.smul(v));
        return sig.r === total.x;
    }
}
