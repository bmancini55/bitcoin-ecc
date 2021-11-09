import { IOperable } from "./Operable";
import { mod, pow } from "./util/BigIntMath";

/**
 * This class encapsulates a finite field element which represents an
 * element in the field F_prime. This class implements `IOperable` and
 * is suitable for mathmatical operations.
 */
export class FieldValue implements IOperable {
    /**
     * Indicates if the field value supports the sqrt operation.
     * Currently this is only supported for prime values that are
     * `prime % 4 = 3`.
     */
    public canSqrt: boolean;

    /**
     * Constructs a finite field element by accepting the value and the
     * order of the field as value.
     * @param num value in the finite field
     * @param prime order of the finite field
     */
    constructor(readonly num: bigint, readonly prime: bigint) {
        if (num >= prime || num < 0n) {
            throw new Error(`Num ${num} not in field range 0 ${prime - 1n}`);
        }
        this.num = num;
        this.prime = prime;

        this.canSqrt = mod(prime, 4n) === 3n;
    }

    public toString() {
        return `FieldValue_${this.prime}(${this.num})`;
    }

    /**
     * Returns true when the other field element is equal to the
     * current field element by matching both its prime order and the
     * value in the field.
     * @param other
     */
    public eq(other: FieldValue): boolean {
        if (!other) return false;
        return this.prime === other.prime && this.num === other.num;
    }

    /**
     * Returns true when the other field element is not equal to the
     * current field element
     * @param other
     */
    public neq(other: FieldValue): boolean {
        return !this.eq(other);
    }

    /**
     * Adds two numbers in the same Field by using the formula:
     * `(a + b) % p`
     */
    public add(other: FieldValue): FieldValue {
        if (this.prime !== other.prime) {
            throw new Error(`Cannot addd two numbers in different Fields`);
        }
        const num = mod(this.num + other.num, this.prime);
        return new FieldValue(num, this.prime);
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
     * @param other
     */
    public sub(other: FieldValue): FieldValue {
        if (this.prime !== other.prime) {
            throw new Error(`Cannot add two numbers in different Fields`);
        }
        const num = mod(this.num - other.num, this.prime);
        return new FieldValue(num, this.prime);
    }

    /**
     * Multiplies two field elements together using the formula:
     *
     * ```
     * (a * b) % p
     * ```
     * @param other
     */
    public mul(other: FieldValue): FieldValue {
        if (this.prime !== other.prime) {
            throw new Error(`Cannot multiply two numbers in different Fields`);
        }
        const num = mod(this.num * other.num, this.prime);
        return new FieldValue(num, this.prime);
    }

    /**
     * Divides one number by another using Fermat's Little Theory which
     * states that `1 = n^(p-1) % p` and means we can find the inverse
     * of using the formula
     *
     * ```
     * (a * b^(p - 2)) % p
     * ```
     * @param other
     */
    public div(other: FieldValue): FieldValue {
        if (this.prime !== other.prime) {
            throw new Error(`Cannot divide two numbers in different Fields`);
        }
        const num = mod(
            this.num * pow(other.num, this.prime - 2n, this.prime),
            this.prime
        );
        return new FieldValue(num, this.prime);
    }

    /**
     * Returns a new `FieldValue` with the value being the current
     * number raised to the provided exponent. We first force the
     * exponent to be positive using Fermats Little Theorem. This uses
     * the formula:
     *
     * ```
     * b = b % (p - 1)
     * (a^b) % p
     * ```
     * @param exponent
     */
    public pow(exponent: bigint): FieldValue {
        exponent = mod(exponent, this.prime - 1n);
        const num = pow(this.num, exponent, this.prime);
        return new FieldValue(num, this.prime);
    }

    /**
     * Scalar multiple, which is the same as a multiplier
     * @param scalar
     */
    public smul(scalar: bigint): FieldValue {
        const num = mod(this.num * scalar, this.prime);
        return new FieldValue(num, this.prime);
    }

    /**
     * Calculate the sqrt of the finite field which is possible if
     * `p % 4 = 3`. The formula for this is:
     *
     * ```
     * v^((P + 1) / 4)
     * ```
     */
    public sqrt(): FieldValue {
        if (!this.canSqrt) {
            throw new Error("No algorithm for sqrt");
        }
        return this.pow((this.prime + 1n) / 4n);
    }

    /**
     * Returns true if the value is even
     * @returns
     */
    public isEven(): boolean {
        return mod(this.num, 2n) === 0n;
    }
}
