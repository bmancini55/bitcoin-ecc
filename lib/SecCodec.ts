import { FieldValue } from "./FieldValue";
import { Point } from "./Point";
import { Secp256k1 } from "./Secp256k1";
import { bigFromBuf, bigToBuf } from "./util/BigIntUtil";

export class SecCodec {
    /**
     * Parses an SEC public key from either uncompressed format or
     * compressed format
     * @param buf
     */
    public static decode(buf: Buffer): Point<FieldValue> {
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
    public static encode(
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
