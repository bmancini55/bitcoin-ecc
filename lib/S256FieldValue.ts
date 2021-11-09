import { FieldValue } from "./FieldValue";
import { Secp256k1 } from "./Secp256k1";

/**
 * Defines a subclass of a `FieldValue` for use with `secp256k1`.
 * This allows a simpler method so we do not have to pass in P all the
 * time, it also allows us to strongly type `P256Secret` and `P256Point`
 * with values that belong to to the field.
 */
export class S256FieldValue extends FieldValue {
    constructor(num: bigint) {
        super(num, Secp256k1.P);
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
        const r = this.pow((Secp256k1.P + 1n) / 4n);
        return new S256FieldValue(r.num);
    }
}
