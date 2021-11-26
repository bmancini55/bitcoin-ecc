import { Curve } from "./Curve";
import { FiniteField } from "./FiniteField";

export class CurveScalar {
    public static isCurveScalar(val: any): val is CurveScalar {
        return val instanceof CurveScalar;
    }

    public static assertGroup(a: CurveScalar, b: CurveScalar) {
        if (a.group.p !== b.group.p) {
            throw new Error("Group is not the same");
        }
    }

    public group: FiniteField;

    constructor(readonly curve: Curve, readonly value: bigint) {
        if (value < 1n) {
            throw new Error("Curve scalar too small");
        }
        if (value > curve.N) {
            throw new Error("Curve scalar too large");
        }

        this.group = new FiniteField(curve.N);
    }

    public sadd(b: CurveScalar | bigint): CurveScalar {
        return new CurveScalar(this.curve, this.group.add(this.value, this._bigFromArg(b)));
    }

    public ssub(b: CurveScalar | bigint): CurveScalar {
        return new CurveScalar(this.curve, this.group.sub(this.value, this._bigFromArg(b)));
    }

    public smul(b: CurveScalar | bigint): CurveScalar {
        return new CurveScalar(this.curve, this.group.mul(this.value, this._bigFromArg(b)));
    }

    public sdiv(b: CurveScalar | bigint): CurveScalar {
        return new CurveScalar(this.curve, this.group.div(this.value, this._bigFromArg(b)));
    }

    public neg() {
        return new CurveScalar(this.curve, this.group.neg(this.value));
    }

    public eq(b: CurveScalar) {
        return this.curve.eq(b.curve) && this.value == b.value;
    }

    protected _bigFromArg(arg: CurveScalar | bigint): bigint {
        if (CurveScalar.isCurveScalar(arg)) {
            CurveScalar.assertGroup(this, arg);
            return arg.value;
        } else {
            return arg;
        }
    }
}
