import { Rfc6979 } from "./Rfc6979";
import { Secp256k1 } from "./Secp256k1";
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
        const g = Secp256k1.group;
        const k = Rfc6979.genK(secret, z, Secp256k1.N);
        const r = Secp256k1.G.smul(k).x;
        // const kinv = pow(k, Secp256k1.N - 2n, Secp256k1.N);
        // let s = mod((z + r * secret) * kinv, Secp256k1.N);

        let s = g.div(g.add(z, g.mul(r, secret)), k);
        if (s > g.p / 2n) {
            s = g.neg(s);
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
        const g = Secp256k1.group;
        const u = g.div(z, sig.s);
        const v = g.div(sig.r, sig.s);
        const total = Secp256k1.G.smul(u).add(point.smul(v));
        return sig.r === total.x;
    }
}
