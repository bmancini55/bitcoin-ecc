import { FieldValue } from "./FieldValue";
import { Secp256k1 } from "./Secp256k1";
import { mod } from "./util/BigIntMath";
import { bigFromBuf, bigToBuf } from "./util/BigIntUtil";
import { combine, xor } from "./util/BufferUtil";
import { sha256 } from "./util/Sha256";

function hash(tag: string, ...value: Buffer[]): Buffer {
    const tagHash = sha256(Buffer.from(tag, "utf8"));
    return sha256(combine(tagHash, tagHash, ...value));
}

export class Schnorr {
    public static pubkey(secret: bigint): FieldValue {
        return Secp256k1.pointFromSecret(secret).x;
    }

    public static sign(sk: Buffer, m: Buffer, a: Buffer): [Buffer, Buffer] {
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
        return [bigToBuf(R.x.num, 32), bigToBuf(mod(k + e * d, Secp256k1.N), 32)];
    }
}
