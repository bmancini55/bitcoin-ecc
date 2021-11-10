import { IOperable } from "./Operable";

/**
 * This class is a a generic point on some elliptic cuve. The curve must
 * have the form `y^2 = x^3 + ax + b` and is defined by the two values
 * `a` and `b`.
 */
export class Point<T extends IOperable> {
    /**
     * Returns the point at infinity
     * @param a
     * @param b
     */
    public static infinity<T extends IOperable>(a: T, b: T) {
        return new Point(undefined, undefined, a, b);
    }

    /**
     *
     * @param x x-coordinate of the generator point
     * @param y y-coordinate of the generator point
     * @param a curve definition
     * @param b curve definition
     * @returns
     */
    constructor(readonly x: T, readonly y: T, readonly a: T, readonly b: T) {
        if (x === undefined && y === undefined) {
            return;
        }
        // validate that the point (x,y) is on the curve which means
        // `y^2 == x^3 + a * x + b`. If this doest hold, the point is not
        // on the curve
        if (y.pow(2n).neq(x.pow(3n).add(a.mul(x)).add(b))) {
            throw new Error(`(${x}, ${y}) is not on the curve`);
        }
    }

    public toString() {
        if (this.x === undefined) {
            return "Point(infinity)";
        } else {
            return `Point(${this.x},${this.y})_${this.a}_${this.b}`;
        }
    }

    /**
     * Returns true when the values (x, y, a, b) of this point match the
     * values of the other point.
     * @param other
     */
    public eq(other: Point<T>): boolean {
        if (!other) return false;
        return (
            ((this.x && this.x.eq(other.x)) || (!this.x && !other.x)) &&
            ((this.y && this.y.eq(other.y)) || (!this.y && !other.y)) &&
            this.a.eq(other.a) &&
            this.b.eq(other.b)
        );
    }

    /**
     * Returns true when the values (x, y, a, b) of this point do not
     * match the other point
     * @param other
     */
    public neq(other: Point<T>): boolean {
        return !this.eq(other);
    }

    /**
     * Returns true when the x and y values supplied are on the curve
     * @param x
     * @param y
     */
    public onCurve(x: IOperable, y: IOperable): boolean {
        // y^2 === x^3 + a * x + b
        return y.pow(2n).eq(x.pow(3n).add(this.a.mul(x).add(this.b)));
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
    public add(other: Point<T>): Point<T> {
        if (this.a.neq(other.a) || this.b.neq(other.b)) {
            throw new Error(`Points ${this} and ${other} are not on same curve`);
        }

        // handle me as identity point
        if (this.x === undefined) return other;

        // handle other as identity point
        if (other.x === undefined) return this;

        // handle additive inverse, same x but different y
        if (this.x.eq(other.x) && this.y.neq(other.y)) {
            return Point.infinity(this.a, this.b);
        }

        // handle when this.x !== other.x
        if (this.x.neq(other.x)) {
            const s = other.y.sub(this.y).div(other.x.sub(this.x));
            const x = s.pow(2n).sub(this.x).sub(other.x) as T;
            const y = s.mul(this.x.sub(x)).sub(this.y) as T;
            return new Point<T>(x, y, this.a, this.b);
        }

        // handle when tangent line is vertical
        if (this.eq(other) && this.y.eq(this.x.smul(0n))) {
            return Point.infinity(this.a, this.b);
        }

        // handle when p1 = p2
        if (this.eq(other)) {
            const s = this.x.pow(2n).smul(3n).add(this.a).div(this.y.smul(2n));
            const x = s.pow(2n).sub(this.x.smul(2n)) as T;
            const y = s.mul(this.x.sub(x)).sub(this.y) as T;
            return new Point<T>(x, y, this.a, this.b);
        }
    }

    /**
     * Inverts the point across the x-axis by negating the y value.
     */
    public inverse(): Point<T> {
        if (this.x === undefined) {
            return Point.infinity(this.a, this.b);
        }

        return new Point<T>(this.x, this.y.neg() as T, this.a, this.b);
    }

    /**
     * Subtracts the value from the current point. Internally this
     * simply negates the other point and adds it to our point.
     * @param other
     */
    public sub(other: Point<T>): Point<T> {
        return this.add(other.inverse());
    }

    /**
     * Scalar multiply a point using binary expansion
     * @param scalar
     */
    public smul(scalar: bigint): Point<T> {
        let current: Point<T> = this;
        let result = new Point<T>(undefined, undefined, this.a, this.b);
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
