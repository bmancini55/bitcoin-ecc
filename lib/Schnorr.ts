import { FieldValue } from "./FieldValue";
import { Point } from "./Point";
import { Secp256k1 } from "./Secp256k1";
import { mod, pow } from "./util/BigIntMath";
import { bigFromBuf, bigToBuf } from "./util/BigIntUtil";
import { combine, xor } from "./util/BufferUtil";
import { sha256 } from "./util/Sha256";

function hash(tag: string, ...value: Buffer[]): Buffer {
    const tagHash = sha256(Buffer.from(tag, "utf8"));
    return sha256(combine(tagHash, tagHash, ...value));
}

function lift(x: bigint): Point<FieldValue> {
    const p = Secp256k1.P;
    const c = mod(x ** 3n + 7n, p);
    const y = pow(c, (p + 1n) / 4n, p);

    if (c !== pow(y, 2n, p)) {
        throw new Error("liftX failed");
    }

    return new Point(
        Secp256k1.fieldValue(x),
        Secp256k1.fieldValue(y % 2n === 0n ? y : p - y),
        Secp256k1.a,
        Secp256k1.b
    );
}

export class Schnorr {
    public static pubkey(secret: bigint): FieldValue {
        return Secp256k1.pointFromSecret(secret).x;
    }

    public static sign(sk: Buffer, m: Buffer, a: Buffer): Buffer {
        // d' = int(sk)
        const dp = bigFromBuf(sk);

        // fail if d' == 0 or >= N
        if (dp == 0n || dp >= Secp256k1.N) {
            throw new Error("Invalid secret key");
        }

        // P = d'*G
        const P = Secp256k1.G.smul(dp);

        // d = d' if has_even_y(P), otherwise let d = n - d'
        const d = P.y.isEven() ? dp : Secp256k1.N - dp;

        // t = byte-wise xor of bytes(d) and hashBIP0340/aux(a)
        const t = xor(bigToBuf(d, 32), hash("BIP0340/aux", a));

        // rand = hashBIP0340/nonce(t || bytes(P) || m)
        const rand = hash("BIP0340/nonce", t, bigToBuf(P.x.num, 32), m);

        // k' = int(rand) mod n
        const kp = mod(bigFromBuf(rand), Secp256k1.N);

        // Fail if k' = 0.
        if (kp === 0n) {
            throw new Error("k' is 0");
        }

        // R = k'⋅G
        const R = Secp256k1.G.smul(kp);

        // k = k' if has_even_y(R), otherwise let k = n - k'
        const k = R.y.isEven() ? kp : Secp256k1.N - kp;

        // e = int(hashBIP0340/challenge(bytes(R) || bytes(P) || m)) mod n
        const e = mod(
            bigFromBuf(hash("BIP0340/challenge", bigToBuf(R.x.num, 32), bigToBuf(P.x.num, 32), m)),
            Secp256k1.N
        );

        // sig = bytes(R) || bytes((k + ed) mod n)
        const sig = combine(bigToBuf(R.x.num, 32), bigToBuf(mod(k + e * d, Secp256k1.N), 32));

        // Verify(bytes(P), m, sig) (see below) returns failure, abort
        if (!Schnorr.verify(bigToBuf(P.x.num, 32), m, sig)) {
            throw new Error("Verification failed");
        }

        // return the signature sig
        return sig;
    }

    public static verify(pk: Buffer, m: Buffer, sig: Buffer): boolean {
        if (pk.length !== 32) {
            throw new Error("Invalid public key for Schnorr verification");
        }

        if (m.length !== 32) {
            throw new Error("Invalid message for Schnorr verification");
        }

        if (sig.length !== 64) {
            throw new Error("Invalid signature for Schnorr verification");
        }

        // P = lift_x(int(pk)); fail if that fails.
        const P = lift(bigFromBuf(pk));

        // r = int(sig[0:32]); fail if r ≥ p.
        const r = bigFromBuf(sig.slice(0, 32));
        if (r >= Secp256k1.P) {
            throw new Error("Invalid r in Schnorr signiture");
        }

        // s = int(sig[32:64]); fail if s ≥ n
        const s = bigFromBuf(sig.slice(32));
        if (s >= Secp256k1.N) {
            throw new Error("Invalid s in Schnorr signiture");
        }

        // e = int(hashBIP0340/challenge(bytes(r) || bytes(P) || m)) mod n
        const e = mod(
            bigFromBuf(hash("BIP0340/challenge", bigToBuf(r, 32), bigToBuf(P.x.num, 32), m)),
            Secp256k1.N
        );

        // R = s⋅G - e⋅P
        const R = Secp256k1.G.smul(s).sub(P.smul(e));

        // Fail if is_infinite(R).
        if (R.x === undefined) {
            return false;
        }

        // Fail if not has_even_y(R).
        if (!R.y.isEven()) {
            return false;
        }

        // Fail if x(R) ≠ r.
        if (R.x.num !== r) {
            return false;
        }

        // otherwise return true
        return true;
    }
}
