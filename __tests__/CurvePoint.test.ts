import { expect } from "chai";
import { Curve } from "../lib/Curve";
import { CurvePoint } from "../lib/CurvePoint";

describe("CurvePoint", () => {
    describe(".add()", () => {
        const curve = new Curve(223n, 0n, 7n, 21n, 17n, 56n);

        it("should add different points", () => {
            const p1 = new CurvePoint(curve, 192n, 105n);
            const p2 = new CurvePoint(curve, 17n, 56n);
            const r = p1.add(p2);
            expect(r.x).to.equal(170n);
            expect(r.y).to.equal(142n);
        });

        it("should add different points", () => {
            const p1 = new CurvePoint(curve, 170n, 142n);
            const p2 = new CurvePoint(curve, 60n, 139n);
            const r = p1.add(p2);
            expect(r.x).to.equal(220n);
            expect(r.y).to.equal(181n);
        });

        it("should add different points", () => {
            const p1 = new CurvePoint(curve, 47n, 71n);
            const p2 = new CurvePoint(curve, 17n, 56n);
            const r = p1.add(p2);
            expect(r.x).to.equal(215n);
            expect(r.y).to.equal(68n);
        });

        it("should add different points", () => {
            const p1 = new CurvePoint(curve, 143n, 98n);
            const p2 = new CurvePoint(curve, 76n, 66n);
            const r = p1.add(p2);
            expect(r.x).to.equal(47n);
            expect(r.y).to.equal(71n);
        });

        it("should add value to point of infinity", () => {
            const p1 = new CurvePoint(curve, undefined, undefined);
            const p2 = new CurvePoint(curve, 76n, 66n);
            const r = p1.add(p2);
            expect(r.x).to.equal(76n);
            expect(r.y).to.equal(66n);
        });

        it("should add point of infinity to value", () => {
            const p1 = new CurvePoint(curve, 76n, 66n);
            const p2 = new CurvePoint(curve, undefined, undefined);
            const r = p1.add(p2);
            expect(r.x).to.equal(76n);
            expect(r.y).to.equal(66n);
        });

        it("should add negated points", () => {
            const p1 = new CurvePoint(curve, 76n, 66n);
            const p2 = new CurvePoint(curve, 76n, 223n - 66n);
            const r = p1.add(p2);
            expect(r.x).to.equal(undefined);
            expect(r.y).to.equal(undefined);
        });

        it("should add same point", () => {
            const p1 = new CurvePoint(curve, 47n, 71n);
            const p2 = new CurvePoint(curve, 47n, 71n);
            const r = p1.add(p2);
            expect(r.x).to.equal(36n);
            expect(r.y).to.equal(111n);
        });
    });

    describe(".smul()", () => {
        const curve = new Curve(223n, 0n, 7n, 21n, 47n, 71n);

        const tests = [
            [1n, [47n, 71n]],
            [2n, [36n, 111n]],
            [10n, [154n, 150n]],
            [16n, [126n, 127n]],
            [20n, [47n, 152n]],
        ];

        for (const [scalar, ex] of tests) {
            it(`scalar ${scalar} eqs ${ex}`, () => {
                const p2 = curve.G.smul(scalar as bigint);
                expect(p2.x).to.equal(ex[0]);
                expect(p2.y).to.equal(ex[1]);
            });
        }

        for (let i = 1n; i < 223n; i++) {
            if (curve.G.smul(i).x === undefined) {
                console.log("poi", i);
            }
        }
    });
});
