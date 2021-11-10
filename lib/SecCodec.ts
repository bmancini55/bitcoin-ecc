import { Secp256k1 } from "./Secp256k1";
import { CurvePoint } from "./CurvePoint";
import { bigFromBuf, bigToBuf } from "./util/BigIntUtil";

export class SecCodec {
    /**
     * Parses an SEC public key from either uncompressed format or
     * compressed format
     * @param buf
     */
    public static decode(buf: Buffer): CurvePoint {
        // uncompressed point
        if (buf[0] === 0x04) {
            const x = bigFromBuf(buf.slice(1, 33));
            const y = bigFromBuf(buf.slice(33, 65));
            return new CurvePoint(Secp256k1, x, y);
        }
        // compressed format
        else {
            const f = Secp256k1.field;

            // x is easy to get
            const x = bigFromBuf(buf.slice(1));

            // right side of equation y^2 = x^3 +7
            const right = f.add(f.pow(x, 3n), Secp256k1.b);

            // solve the left side of the equation, this will result in
            // two values for positive and negative: y and p-y
            const beta = f.sqrt(right);

            let evenBeta: bigint;
            let oddBeta: bigint;

            if (beta % 2n === 0n) {
                evenBeta = beta;
                oddBeta = Secp256k1.P - beta;
            } else {
                evenBeta = Secp256k1.P - beta;
                oddBeta = beta;
            }

            const isEven = buf[0] === 0x02;
            if (isEven) {
                return new CurvePoint(Secp256k1, x, evenBeta);
            } else {
                return new CurvePoint(Secp256k1, x, oddBeta);
            }
        }
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
    public static encode(point: CurvePoint, compressed: boolean = false): Buffer {
        if (compressed) {
            const prefix = point.y % 2n === 0n ? 2 : 3;
            return Buffer.concat([Buffer.from([prefix]), bigToBuf(point.x)]);
        } else {
            return Buffer.concat([Buffer.from([0x04]), bigToBuf(point.x), bigToBuf(point.y)]);
        }
    }
}
