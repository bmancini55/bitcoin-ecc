import { expect } from "chai";
import { FiniteField } from "../lib/FiniteField";

describe("FiniteField", () => {
    describe(".add()", () => {
        it("should not wrap", () => {
            const f = new FiniteField(13n);
            const a = 7n;
            const b = 1n;
            expect(f.add(a, b)).to.equal(8n);
        });

        it("should wrap", () => {
            const f = new FiniteField(13n);
            const a = 7n;
            const b = 6n;
            expect(f.add(a, b)).to.equal(0n);
        });
    });

    describe(".sub()", () => {
        it("should not wrap", () => {
            const f = new FiniteField(13n);
            const a = 7n;
            const b = 1n;
            expect(f.sub(a, b)).to.equal(6n);
        });

        it("should wrap", () => {
            const f = new FiniteField(13n);
            const a = 7n;
            const b = 8n;
            expect(f.sub(a, b)).to.equal(12n);
        });
    });

    describe(".mul()", () => {
        it("should not wrap", () => {
            const f = new FiniteField(13n);
            const a = 3n;
            const b = 2n;
            expect(f.mul(a, b)).to.equal(6n);
        });

        it("should wrap", () => {
            const f = new FiniteField(13n);
            const a = 7n;
            const b = 3n;
            expect(f.mul(a, b)).to.equal(8n);
        });
    });

    describe(".div()", () => {
        it("should not wrap", () => {
            const f = new FiniteField(13n);
            const a = 6n;
            const b = 2n;
            expect(f.div(a, b)).to.equal(3n);
        });

        it("should wrap", () => {
            const f = new FiniteField(19n);
            const a = 2n;
            const b = 7n;
            expect(f.div(a, b)).to.equal(3n);
        });
    });

    describe(".pow()", () => {
        it("should not wrap", () => {
            const f = new FiniteField(13n);
            const a = 3n;
            const e = 2n;
            expect(f.pow(a, e)).to.equal(9n);
        });

        it("should wrap", () => {
            const f = new FiniteField(13n);
            const a = 3n;
            const e = 3n;
            expect(f.pow(a, e)).to.equal(1n);
        });

        it("should handle negative exponent", () => {
            const f = new FiniteField(13n);
            const a = 7n;
            const e = -3n;
            expect(f.pow(a, e)).to.equal(8n);
        });
    });

    describe(".neg()", () => {
        it("should return value that makes a + b = 0", () => {
            const f = new FiniteField(7n);
            const a = 3n;
            expect(f.neg(a)).to.equal(4n);
        });
    });
});
