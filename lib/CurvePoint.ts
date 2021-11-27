import { Curve } from "./Curve";
import { CurveScalar } from "./CurveScalar";

/**
 * This class is a a generic point on some elliptic cuve. The curve must
 * have the form `y^2 = x^3 + ax + b` and is defined by the two values
 * `a` and `b`.
 */
export class CurvePoint {
    /**
     * @param curve elliptic curve
     * @param x x-coordinate of the generator point
     * @param y y-coordinate of the generator point
     * @returns
     */
    constructor(readonly curve: Curve, readonly x: bigint, readonly y: bigint) {
        if (x === undefined && y === undefined) {
            return;
        }

        // validate that the point (x,y) is on the curve which means
        // `y^2 == x^3 + a * x + b`. If this doest hold, the point is not
        // on the curve
        if (!curve.onCurve(x, y)) {
            throw new Error(`(${x}, ${y}) is not on the curve`);
        }
    }

    /**
     * Returns true when the values (x, y, a, b) of this point match the
     * values of the other point.
     * @param other
     */
    public eq(other: CurvePoint): boolean {
        if (!other) return false;
        return (
            ((this.x && this.x === other.x) || (!this.x && !other.x)) &&
            ((this.y && this.y === other.y) || (!this.y && !other.y)) &&
            this.curve.eq(other.curve)
        );
    }

    /**
     * Perform point addition which has several cases:
     * 1. Adding identity to a point returns the point
     * 2. Adding a point to the identity returns the point
     * 3. When not the same point, we obtain the slope, connect to the
     *    third point on the curve and reflect across the x-axis
     * 4. When the tangent line is vertical, we return the identity
     * 5. When p1=p2, we obtain the tangent, connect to a third point
     *    the curve and reflect across the x-axis
     * @param other
     */
    public add(other: CurvePoint): CurvePoint {
        // if (this.a.neq(other.a) || this.b.neq(other.b)) {
        //     throw new Error(`Points ${this} and ${other} are not on same curve`);
        // }
        const f = this.curve.field;

        // handle me as identity point
        if (this.x === undefined) return other;

        // handle other as identity point
        if (other.x === undefined) return this;

        // handle additive inverse, same x but different y
        if (this.x === other.x && this.y !== other.y) {
            return new CurvePoint(this.curve, undefined, undefined);
        }

        // handle when this.x !== other.x
        if (this.x !== other.x) {
            const s = f.div(f.sub(other.y, this.y), f.sub(other.x, this.x));
            const x = f.sub(f.sub(f.pow(s, 2n), this.x), other.x);
            const y = f.sub(f.mul(s, f.sub(this.x, x)), this.y);
            return new CurvePoint(this.curve, x, y);
        }

        // handle when tangent line is vertical
        if (this.eq(other) && this.y === f.mul(this.x, 0n)) {
            return new CurvePoint(this.curve, undefined, undefined);
        }

        // handle when p1 = p2
        if (this.eq(other)) {
            const s = f.div(f.add(f.mul(f.pow(this.x, 2n), 3n), this.curve.a), f.mul(this.y, 2n));
            const x = f.sub(f.pow(s, 2n), f.mul(this.x, 2n));
            const y = f.sub(f.mul(s, f.sub(this.x, x)), this.y);
            return new CurvePoint(this.curve, x, y);
        }
    }

    /**
     * Inverts the point across the x-axis by negating the y value.
     */
    public invert(): CurvePoint {
        if (this.x === undefined) {
            return new CurvePoint(this.curve, undefined, undefined);
        }
        return new CurvePoint(this.curve, this.x, this.curve.field.neg(this.y));
    }

    /**
     * Subtracts the value from the current point. Internally this
     * simply negates the other point and adds it to our point.
     * @param other
     */
    public sub(other: CurvePoint): CurvePoint {
        return this.add(other.invert());
    }

    /**
     * Scalar multiply a point using binary expansion
     * @param scalar
     */
    public smul(scalar: CurveScalar | bigint): CurvePoint {
        let num = CurveScalar.isCurveScalar(scalar) ? scalar.value : scalar;
        let current: CurvePoint = this;
        let result = new CurvePoint(this.curve, undefined, undefined);
        while (num) {
            if (num & 1n) {
                result = result.add(current);
            }
            current = current.add(current);
            num = num >> 1n;
        }
        return result;
    }
}
