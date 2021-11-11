import { Secp256k1 } from "./Secp256k1";
import { bigFromBuf, bigToBuf } from "./util/BigIntUtil";
import { combine, xor } from "./util/BufferUtil";
import { sha256 } from "./util/Sha256";
import { CurvePoint } from "./CurvePoint";
import { mod, pow } from "./util/BigIntMath";
import { SchnorrSig } from "./SchnorrSig";

function hash(tag: string, ...value: Buffer[]): Buffer {
    const tagHash = sha256(Buffer.from(tag, "utf8"));
    return sha256(combine(tagHash, tagHash, ...value));
}

function lift(x: bigint): CurvePoint {
    const p = Secp256k1.P;
    const f = Secp256k1.field;

    // c=x^3+7
    const c = f.add(f.pow(x, 3n), 7n);

    // sqrt(c) = c^((p+1)/4)
    const y = f.sqrt(c);

    if (c !== f.pow(y, 2n)) {
        throw new Error("liftX failed");
    }

    return new CurvePoint(Secp256k1, x, y % 2n === 0n ? y : p - y);
}

export class Schnorr {
    public static sign(sk: Buffer, m: Buffer, a: Buffer): SchnorrSig {
        const f = Secp256k1.field;

        // d' = int(sk)
        const dp = bigFromBuf(sk);

        // fail if d' == 0 or >= N
        if (dp == 0n || dp >= Secp256k1.N) {
            throw new Error("Invalid secret key");
        }

        // P = d'*G
        const P = Secp256k1.G.smul(dp);

        // d = d' if has_even_y(P), otherwise let d = n - d'
        const d = P.y % 2n === 0n ? dp : Secp256k1.N - dp;

        // t = byte-wise xor of bytes(d) and hashBIP0340/aux(a)
        const t = xor(bigToBuf(d, 32), hash("BIP0340/aux", a));

        // rand = hashBIP0340/nonce(t || bytes(P) || m)
        const rand = hash("BIP0340/nonce", t, bigToBuf(P.x, 32), m);

        // k' = int(rand) mod n
        const kp = mod(bigFromBuf(rand), Secp256k1.N);

        // Fail if k' = 0.
        if (kp === 0n) {
            throw new Error("k' is 0");
        }

        // R = k'⋅G
        const R = Secp256k1.G.smul(kp);

        // k = k' if has_even_y(R), otherwise let k = n - k'
        const k = R.y % 2n === 0n ? kp : Secp256k1.N - kp;

        // e = int(hashBIP0340/challenge(bytes(R) || bytes(P) || m)) mod n
        const e = mod(
            bigFromBuf(hash("BIP0340/challenge", bigToBuf(R.x, 32), bigToBuf(P.x, 32), m)),
            Secp256k1.N
        );

        // s = (k + ed) mod n
        const s = mod(k + e * d, Secp256k1.N);

        // sig = bytes(R) || bytes(s)
        const sig = new SchnorrSig(R.x, s);

        // Verify(bytes(P), m, sig) (see below) returns failure, abort
        if (!Schnorr.verify(bigToBuf(P.x, 32), m, sig)) {
            throw new Error("Verification failed");
        }

        // return the signature sig
        return sig;
    }

    public static verify(pk: Buffer, m: Buffer, sig: SchnorrSig): boolean {
        if (pk.length !== 32) {
            throw new Error("Invalid public key for Schnorr verification");
        }

        if (m.length !== 32) {
            throw new Error("Invalid message for Schnorr verification");
        }

        // P = lift_x(int(pk)); fail if that fails.
        const P = lift(bigFromBuf(pk));

        // r = int(sig[0:32]); fail if r ≥ p.
        if (sig.r >= Secp256k1.P) {
            throw new Error("Invalid r in Schnorr signiture");
        }

        // s = int(sig[32:64]); fail if s ≥ n
        if (sig.s >= Secp256k1.N) {
            throw new Error("Invalid s in Schnorr signiture");
        }

        // e = int(hashBIP0340/challenge(bytes(r) || bytes(P) || m)) mod n
        const e = mod(
            bigFromBuf(hash("BIP0340/challenge", bigToBuf(sig.r, 32), bigToBuf(P.x, 32), m)),
            Secp256k1.N
        );

        // R = s⋅G - e⋅P
        const R = Secp256k1.G.smul(sig.s).sub(P.smul(e));

        // Fail if is_infinite(R).
        if (R.x === undefined) {
            return false;
        }

        // Fail if not has_even_y(R).
        if (R.y % 2n !== 0n) {
            return false;
        }

        // Fail if x(R) ≠ r.
        if (R.x !== sig.r) {
            return false;
        }

        // otherwise return true
        return true;
    }
}
