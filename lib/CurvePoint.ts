import { Curve } from "./Curve";

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

        const fp = curve.field;
        // validate that the point (x,y) is on the curve which means
        // `y^2 == x^3 + a * x + b`. If this doest hold, the point is not
        // on the curve
        if (fp.pow(y, 2n) !== fp.add(fp.add(fp.pow(x, 3n), fp.mul(curve.a, x)), curve.b)) {
            throw new Error(`(${x}, ${y}) is not on the curve`);
        }
    }

    public toString() {
        if (this.x === undefined) {
            return "CurvePoint(infinity)";
        } else {
            return `CurvePoint(${this.x},${this.y})_${this.curve.a}_${this.curve.b}`;
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
            this.curve.a === other.curve.a &&
            this.curve.b === other.curve.b
        );
    }

    /**
     * Returns true when the values (x, y, a, b) of this point do not
     * match the other point
     * @param other
     */
    public neq(other: CurvePoint): boolean {
        return !this.eq(other);
    }

    /**
     * Returns true when the x and y values supplied are on the curve
     * @param x
     * @param y
     */
    public onCurve(x: bigint, y: bigint): boolean {
        // y^2 === x^3 + a * x + b
        const f = this.curve.field;
        const a = this.curve.a;
        const b = this.curve.b;
        return f.pow(y, 2n) === f.add(f.add(f.pow(x, 3n), f.mul(a, x)), b);
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
    public inverse(): CurvePoint {
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
        return this.add(other.inverse());
    }

    /**
     * Scalar multiply a point using binary expansion
     * @param scalar
     */
    public smul(scalar: bigint): CurvePoint {
        let current: CurvePoint = this;
        let result = new CurvePoint(this.curve, undefined, undefined);
        while (scalar) {
            if (scalar & 1n) {
                result = result.add(current);
            }
            current = current.add(current);
            scalar = scalar >> 1n;
        }
        return result;
    }
}
