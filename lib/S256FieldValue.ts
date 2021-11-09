import { FieldValue } from "./FieldValue";

/**
 * Defines a subclass of a `FieldValue` for use with `secp256k1`.
 * This allows a simpler method so we do not have to pass in P all the
 * time, it also allows us to strongly type `P256Secret` and `P256Point`
 * with values that belong to to the field.
 */
export class S256FieldValue extends FieldValue {
    /**
     * Prime for secp256k1
     *
     * * ```
     * P = 2**256 - 2**32 - 977
     * ```
     */
    public static P = 2n ** 256n - 2n ** 32n - 977n;

    constructor(num: bigint) {
        super(num, S256FieldValue.P);
    }

    /**
     * Calculate the sqrt of the finite field which is possible because
     * `p % 4 = 3`. The formula for this is:
     *
     * ```
     * v ** ((P + 1) / 4)
     * ```
     */
    public sqrt(): S256FieldValue {
        const r = this.pow((S256FieldValue.P + 1n) / 4n);
        return new S256FieldValue(r.num);
    }
}
