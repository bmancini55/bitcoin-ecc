import { FiniteField } from "./FiniteField";
import { CurvePoint } from "./CurvePoint";
import { CurveScalar } from "./CurveScalar";

/**
 * Defines a finite field elliptic curve such as those used in
 * elliptic curve cryptography. This curve is defined as
 *
 * ```
 * y^2=x^3+ax+b
 * ```
 *
 * It includes a generator point `G` and and the point at infinity, `N`.
 */
export class Curve {
    /**
     * Finite field of the curve
     */
    public field: FiniteField;

    /**
     * Cyclic group of the curve.
     */
    public group: FiniteField;

    /**
     * Generator point
     */
    public G: CurvePoint;

    /**
     * @param P order of the field
     * @param a
     * @param b
     * @param N
     * @param Gx
     * @param Gy
     */
    constructor(
        readonly P: bigint,
        readonly a: bigint,
        readonly b: bigint,
        readonly N: bigint,
        readonly Gx: bigint,
        readonly Gy: bigint
    ) {
        this.field = new FiniteField(P);
        this.group = new FiniteField(N);
        this.G = new CurvePoint(this, Gx, Gy);
    }

    /**
     * Returns true if curve definitions are the same
     * @param other
     */
    public eq(other: Curve): boolean {
        return (
            this.P === other.P &&
            this.a === other.a &&
            this.b === other.b &&
            this.Gx === other.Gx &&
            this.Gy === other.Gy
        );
    }

    /**
     * Returns true if the values are on the curve
     * @param x x-coordinate
     * @param y y-coordinate
     */
    public onCurve(x: bigint, y: bigint): boolean {
        const f = this.field;
        return f.pow(y, 2n) === f.add(f.add(f.pow(x, 3n), f.mul(this.a, x)), this.b);
    }

    /**
     * Constructs a CurvePoint with the equation: `P=sk*G`. Fails if the
     * supplied secret is 0 or is greater than the N.
     * @param sk
     * @returns
     */
    public pubPoint(sk: bigint): CurvePoint {
        if (sk === 0n || sk >= this.N) {
            throw new Error("Invalid secret");
        }
        return this.G.smul(sk);
    }
}
