import { FieldValue } from "./FieldValue";
import { Point } from "./Point";

/**
 * Defines the elliptic curve secp256k1
 */
export class Secp256k1 {
    /**
     * Prime for secp256k1
     *
     * * ```
     * P = 2**256 - 2**32 - 977
     * ```
     */
    public static P = 2n ** 256n - 2n ** 32n - 977n;

    /**
     * `a` value defined for secp256k1 for equation `y^2 = x^3 + ax + b`
     */
    public static a = new FieldValue(0n, Secp256k1.P);

    /**
     * `b` value defined for secp256k1 for equation `y^2 = x^3 + ax + b`
     */
    public static b = new FieldValue(7n, Secp256k1.P);

    /**
     * `N` defines the order used by secp256k1
     */
    public static N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n; // prettier-ignore

    /**
     * x-coordinate of the genertor point as a scalar value
     */
    public static Gx = new FieldValue(
        0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
        Secp256k1.P
    );

    /**
     * x-coordinate of the generator point as a scalar value
     */
    public static Gy = new FieldValue(
        0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n,
        Secp256k1.P
    );

    /**
     * Generator as a defined elliptic curve point
     */
    public static G = new Point<FieldValue>(
        Secp256k1.Gx,
        Secp256k1.Gy,
        Secp256k1.a,
        Secp256k1.b
    );

    /**
     * Point at infinity
     */
    public static Infinity = Secp256k1.point(undefined, undefined);

    /**
     * Constructs a new `FieldValue` contained within the curve
     * @param num
     * @returns
     */
    public static fieldValue(num: bigint): FieldValue {
        return new FieldValue(num, Secp256k1.P);
    }

    /**
     * Constructs a new Point
     */
    public static point(x: bigint, y: bigint): Point<FieldValue> {
        return new Point(
            x ? Secp256k1.fieldValue(x) : undefined,
            y ? Secp256k1.fieldValue(y) : undefined,
            Secp256k1.a,
            Secp256k1.b
        );
    }

    /**
     * Generates a point from a secret
     * @param secret
     * @returns
     */
    public static pointFromSecret(secret: bigint): Point<FieldValue> {
        return Secp256k1.G.smul(secret);
    }
}
