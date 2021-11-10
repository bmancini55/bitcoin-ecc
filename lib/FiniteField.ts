import { mod, pow } from "./util/BigIntMath";

/**
 * This class encapsulates a finite field with order P. This class
 * defines various math operations under fp.
 */
export class FiniteField {
    /**
     * @param p prime value
     */
    constructor(readonly p: bigint) {}

    /**
     * Returns a value converted into a valid value in the field. This
     * takes the form `a % p`
     * @param a
     */
    public mod(a: bigint): bigint {
        return mod(a, this.p);
    }

    /**
     * Throws if the value is not in the field
     * @param a
     */
    public assert(a: bigint): void {
        if (a < 0 || a >= this.p) {
            throw new Error("value is not in field");
        }
    }

    /**
     * Adds two numbers in the same Field by using the formula:
     * `(a + b) % p`
     */
    public add(a: bigint, b: bigint): bigint {
        this.assert(a);
        this.assert(b);
        return mod(a + b, this.p);
    }

    /**
     * Subtracts two nubmers in the same Field by using the formula:
     * `(a - b) % p`
     *
     * @remarks
     * This fixes the negative mod issues in JavaScript by using the
     * `mod` helper which uses the formula:
     * ```
     * (n + p) % p
     * ```
     */
    public sub(a: bigint, b: bigint): bigint {
        this.assert(a);
        this.assert(b);
        return mod(a - b, this.p);
    }

    /**
     * Multiplies two field elements together using the formula:
     *
     * ```
     * (a * b) % p
     * ```
     */
    public mul(a: bigint, b: bigint): bigint {
        this.assert(a);
        this.assert(b);
        return mod(a * b, this.p);
    }

    /**
     * Divides one number by another using Fermat's Little Theory which
     * states that `1 = n^(p-1) % p` and means we can find the inverse
     * of using the formula
     *
     * ```
     * (a * b^(p - 2)) % p
     * ```
     */
    public div(a: bigint, b: bigint): bigint {
        this.assert(a);
        this.assert(b);
        return mod(a * pow(b, this.p - 2n, this.p), this.p);
    }

    /**
     * Raises the provided value to the exponent. We first force the
     * exponent to be positive using Fermats Little Theorem. This uses
     * the formula:
     *
     * ```
     * b = b % (p - 1)
     * (a^b) % p
     * ```
     */
    public pow(a: bigint, e: bigint): bigint {
        e = mod(e, this.p - 1n);
        return pow(a, e, this.p);
    }

    /**
     * Negates the field value with the formula `p-n`. This follows from
     * ```
     * n + (p - n) = 0;
     * ```
     */
    public neg(a: bigint): bigint {
        return this.p - a;
    }

    /**
     * Calculate the sqrt of the finite field which is possible if
     * `p % 4 = 3`. The formula for this is:
     *
     * ```
     * v^((P + 1) / 4)
     * ```
     */
    public sqrt(a: bigint): bigint {
        if (this.p % 4n !== 3n) {
            throw new Error("No algorithm for sqrt");
        }
        return this.pow(a, (this.p + 1n) / 4n);
    }
}
