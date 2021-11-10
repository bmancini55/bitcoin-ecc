import { IOperable } from "./Operable";
import { mod } from "./util/BigIntMath";

/**
 * This is a wrapper class for standard lib's `BigInt` type. It conforms
 * to the IOperable type so that it can be used in other math based
 * classes such as Point.
 */
export class IntValue implements IOperable {
    constructor(readonly value: bigint) {}

    public toString() {
        return `Real_${this.value.toString()}`;
    }

    public eq(other: IntValue): boolean {
        if (!other) return false;
        return this.value === other.value;
    }

    public neq(other: IntValue): boolean {
        return !this.eq(other);
    }

    public add(other: IntValue): IntValue {
        return new IntValue(this.value + other.value);
    }

    public sub(other: IntValue): IntValue {
        return new IntValue(this.value - other.value);
    }

    public mul(other: IntValue): IntValue {
        return new IntValue(this.value * other.value);
    }

    public div(other: IntValue): IntValue {
        return new IntValue(this.value / other.value);
    }

    public pow(exponent: bigint): IntValue {
        return new IntValue(this.value ** exponent);
    }

    public smul(scalar: bigint): IntValue {
        return new IntValue(this.value * scalar);
    }

    public isEven(): boolean {
        return mod(this.value, 2n) === 0n;
    }

    public neg(): IntValue {
        return new IntValue(-this.value);
    }
}
