import { Point } from "./Point";
import { mod, pow } from "./util/BigIntMath";
import { Signature } from "./Signature";
import { bigToBuf, bigFromBuf } from "./util/BigIntUtil";
import { Secp256k1 } from "./Secp256k1";
import { FieldValue } from "./FieldValue";

/**
 * Defines a point on the secp256k1 curve by specifying the a and b values.
 * This allows us to initialize a point on the secp256k1 curve easily without
 * needing to specify a and b every time. It also restricts values to the
 * field defined in secp256k1.
 *
 * This class also specifies the order N, and restricts scalar multiplication
 * to the order N.
 */
export class S256Point extends Point<FieldValue> {
    /**
     * Parses an SEC public key from either uncompressed format or
     * compressed format
     * @param buf
     */
    public static parse(buf: Buffer): Point<FieldValue> {
        // uncompressed point
        if (buf[0] === 0x04) {
            const x = bigFromBuf(buf.slice(1, 33));
            const y = bigFromBuf(buf.slice(33, 65));
            return Secp256k1.point(x, y);
        }
        // compressed format
        else {
            // x is easy to get
            const x = new FieldValue(bigFromBuf(buf.slice(1)), Secp256k1.P);

            // right side of equation y^2 = x^3 +7
            const right = x.pow(3n).add(Secp256k1.b); // prettier-ignore

            // solve the left side of the equation, this will result in
            // two values for positive and negative: y and p-y
            const beta = right.sqrt();

            let evenBeta: FieldValue;
            let oddBeta: FieldValue;

            if (beta.num % 2n === 0n) {
                evenBeta = beta;
                oddBeta = Secp256k1.fieldValue(Secp256k1.P - beta.num);
            } else {
                evenBeta = Secp256k1.fieldValue(Secp256k1.P - beta.num);
                oddBeta = beta;
            }

            const isEven = buf[0] === 0x02;
            if (isEven) {
                return Secp256k1.point(x.num, evenBeta.num);
            } else {
                return Secp256k1.point(x.num, oddBeta.num);
            }
        }
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

    /**
     * Encodes the point as SEC (Standards for Efficiency Cryptography) point.
     * All values are encoded as big-endiant.
     *
     * Uncompressed format:
     * ```
     * 0x04 + x + y
     * ```
     *
     * Compressed format:
     * ```
     * 0x02 + x => when y is even
     * 0x03 + x => when y is odd
     * ```
     */
    public static sec(
        point: Point<FieldValue>,
        compressed: boolean = false
    ): Buffer {
        if (compressed) {
            const prefix = point.y.num % 2n === 0n ? 2 : 3;
            return Buffer.concat([
          Buffer.from([prefix]),
          bigToBuf(point.x.num)
        ]); // prettier-ignore
        } else {
            return Buffer.concat([
                Buffer.from([0x04]),
                bigToBuf(point.x.num),
                bigToBuf(point.y.num),
            ]);
        }
    }
}
