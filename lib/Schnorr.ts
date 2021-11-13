import { Secp256k1 } from "./Secp256k1";
import { bigFromBuf, bigToBuf } from "./util/BigIntUtil";
import { combine, xor } from "./util/BufferUtil";
import { sha256 } from "./util/Sha256";
import { CurvePoint } from "./CurvePoint";
import { mod } from "./util/BigIntMath";
import { SchnorrSig } from "./SchnorrSig";
import crypto from "crypto";

/**
 * Implements signing and verifing Schnorr signatures as implemented in
 * BIP340.
 */
export class Schnorr {
    /**
     * Signs a message using the BIP340 implementation of Schnorr
     * signatures. Generally the Schnorr signature algorithm is:
     *
     * ```
     * sign(e, m) where
     *  e = secret
     *  m = hash of the message
     *
     *  G = curve generator
     *  P = e*G
     *  k = some randomly unguessable value
     *  R = k*G
     *  r = R.x
     *  c = hash(R.x || P.x || m)
     *  s = k + c*e
     *
     * sig=(r,s)
     * ```
     *
     * Several optimizations:
     * - An even-y value is forced to prevent inherent mutability of
     * signature via the two valid signature values: (s, n-s). It is
     * forced by using the even-y of the `e` and `k` values
     * - k is protected from reuse via an auxiliary entropy source `aux`
     * that is combined with the public key point and message
     *
     *
     * @param sk secret key (32-bytes)
     * @param m message (32-bytes)
     * @param a auxliary data (32-bytes)
     * @returns
     */
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

    /**
     * Verifies a Schnorr signature according to the generalized
     * formula:
     *
     * ```
     * verify(r, s, P, m)
     *
     *  c = hash(r || P.x || m)
     *  s = k + c*e
     *  sG = kG + ceG
     *  sG = R + cP
     *  R = sG - cP
     *
     * verify R.r = r
     * ```
     *
     * Addiontionally BIP340 requires that we validate the R.y value is
     * even to prevent the inherent mutability of signatures.
     *
     * The supplied public key is a 32-byte value. The even y-value
     * public key is used.
     *
     * @param pk 32-byte private key (x-value)
     * @param m 32-byte message that was signed
     * @param sig 64-byte signature containing (r,s) tuple
     * @returns true if the signature is valid
     */
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

    /**
     * Performs batch verification of a sequence of pubkey, messge,
     * signature tuples.
     * @param pks
     * @param ms
     * @param sigs
     */
    public static batchVerify(pks: Buffer[], msgs: Buffer[], sigs: SchnorrSig[]): boolean {
        if (pks.length !== msgs.length || pks.length !== sigs.length) {
            throw new Error("Invalid inputs");
        }

        const u = pks.length;

        // Generate  a seed for a CSPRNG using sha256 and combining the
        // input data.
        // seed = seed_hash(pk1..pku || m1..mu || sig1..sigu )
        const seed = sha256(combine(...pks, ...msgs, ...sigs.map(sig => sig.toBuffer())));

        // Next we use ChaCha20 to generate u-1 random numbers between 1
        // and the group order for secp256k1.
        const csprng = crypto.createCipheriv("chacha20", seed, Buffer.alloc(16));
        const u256 = Buffer.alloc(32);
        const as: bigint[] = [1n];
        while (as.length < u) {
            const a = bigFromBuf(csprng.update(u256));
            if (a > 0n || a < Secp256k1.N) {
                as.push(a);
            }
        }

        let l: bigint;
        let r: CurvePoint;

        for (let i = 0; i < u; i++) {
            const P = lift(bigFromBuf(pks[i]));
            const ri = sigs[i].r;
            const si = sigs[i].s;
            const ei = bigFromBuf(hash("BIP0340/challenge", bigToBuf(ri), pks[i], msgs[i]));
            const R = lift(ri);
            const ai = as[i];

            if (i === 0) {
                l = sigs[i].s;
                r = R.add(P.smul(ei));
            } else {
                l = mod(l + ai * sigs[i].s, Secp256k1.N);
                r = r.add(R.smul(ai)).add(P.smul(ai).smul(ei));
            }
        }

        const sG = Secp256k1.pubPoint(l);
        if (!sG.eq(r)) return false;

        return true;
    }
}

/**
 * Performs a tagged sha256 hash of the supplied data.  For example:
 *
 * hashBIP0340/aux(a)=sha256(BIP0340/aux||a)
 * @param tag
 * @param value
 * @returns
 */
function hash(tag: string, ...value: Buffer[]): Buffer {
    const tagHash = sha256(Buffer.from(tag, "utf8"));
    return sha256(combine(tagHash, tagHash, ...value));
}

/**
 * Generates a CurvePoint at x with an even y.  This function solves
 * for y and returns the y value that is even of the pair (y, p-y).
 *
 * I order to do this we solve for y in the equation y^2=x^3+7. Then
 * because P%4=3 we are able to solve for the square root of y via the
 * equation c^((p+1)/4).
 * @param x
 * @returns
 */
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
