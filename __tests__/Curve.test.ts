import { expect } from "chai";
import { Curve } from "../lib/Curve";

describe("Curve", () => {
    const curve = new Curve(23n, 0n, 1n, 6n, 2n, 3n);

    describe(".onCurve()", () => {
        it("returns true when values are on the curve", () => {
            expect(curve.onCurve(0n, 22n)).to.equal(true);
        });

        it("returns false when values are not on the curve", () => {
            expect(curve.onCurve(1n, 1n)).to.equal(false);
        });
    });

    describe(".pubPoint", () => {
        it("throws when 0", () => {
            expect(() => curve.pubPoint(0n)).to.throw();
        });

        it("throws when greater than N", () => {
            expect(() => curve.pubPoint(7n)).to.throw();
        });

        it("returns point", () => {
            const sut = curve.pubPoint(2n);
            expect(sut.x).to.equal(0n);
            expect(sut.y).to.equal(1n);
        });
    });
});
