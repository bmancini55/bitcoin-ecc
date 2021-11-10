import { expect } from "chai";
import { FieldValue } from "../lib/FieldValue";

describe("FieldValue", () => {
    describe(".toString()", () => {
        it("should stringify correctly", () => {
            expect(new FieldValue(7n, 13n).toString()).to.equal("FieldValue_13(7)");
        });
    });

    describe(".eq()", () => {
        it("should return false for undefined", () => {
            const a = new FieldValue(7n, 13n);
            const b = undefined;
            expect(a.eq(b)).to.equal(false);
        });

        it("should return true for equal", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(7n, 13n);
            expect(a.eq(b)).to.equal(true);
        });

        it("should return false for different num", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(8n, 13n);
            expect(a.eq(b)).to.equal(false);
        });

        it("should return false for different prime", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(7n, 17n);
            expect(a.eq(b)).to.equal(false);
        });
    });

    describe(".neq()", () => {
        it("should return true for undefined", () => {
            const a = new FieldValue(7n, 13n);
            const b = undefined;
            expect(a.neq(b)).to.equal(true);
        });

        it("should return false for equal", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(7n, 13n);
            expect(a.neq(b)).to.equal(false);
        });

        it("should return true for different num", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(8n, 13n);
            expect(a.neq(b)).to.equal(true);
        });

        it("should return false for different prime", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(7n, 17n);
            expect(a.neq(b)).to.equal(true);
        });
    });

    describe(".add()", () => {
        it("should throw when not in same field", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(1n, 17n);
            expect(() => a.add(b)).to.throw();
        });

        it("should not wrap", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(1n, 13n);
            expect(a.add(b)).to.deep.equal(new FieldValue(8n, 13n));
        });

        it("should wrap", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(6n, 13n);
            expect(a.add(b)).to.deep.equal(new FieldValue(0n, 13n));
        });
    });

    describe(".sub()", () => {
        it("should throw when not in same field", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(1n, 17n);
            expect(() => a.sub(b)).to.throw();
        });

        it("should not wrap", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(1n, 13n);
            expect(a.sub(b)).to.deep.equal(new FieldValue(6n, 13n));
        });

        it("should wrap", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(8n, 13n);
            expect(a.sub(b)).to.deep.equal(new FieldValue(12n, 13n));
        });
    });

    describe(".mul()", () => {
        it("should throw when not in same field", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(1n, 17n);
            expect(() => a.mul(b)).to.throw();
        });

        it("should not wrap", () => {
            const a = new FieldValue(3n, 13n);
            const b = new FieldValue(2n, 13n);
            expect(a.mul(b)).to.deep.equal(new FieldValue(6n, 13n));
        });

        it("should wrap", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(3n, 13n);
            expect(a.mul(b)).to.deep.equal(new FieldValue(8n, 13n));
        });
    });

    describe(".div()", () => {
        it("should throw when not in same field", () => {
            const a = new FieldValue(7n, 13n);
            const b = new FieldValue(1n, 17n);
            expect(() => a.div(b)).to.throw();
        });

        it("should not wrap", () => {
            const a = new FieldValue(6n, 13n);
            const b = new FieldValue(2n, 13n);
            expect(a.div(b)).to.deep.equal(new FieldValue(3n, 13n));
        });

        it("should wrap", () => {
            const a = new FieldValue(2n, 19n);
            const b = new FieldValue(7n, 19n);
            expect(a.div(b)).to.deep.equal(new FieldValue(3n, 19n));
        });
    });

    describe(".pow()", () => {
        it("should not wrap", () => {
            const a = new FieldValue(3n, 13n);
            const e = 2n;
            expect(a.pow(e)).to.deep.equal(new FieldValue(9n, 13n));
        });

        it("should wrap", () => {
            const a = new FieldValue(3n, 13n);
            const e = 3n;
            expect(a.pow(e)).to.deep.equal(new FieldValue(1n, 13n));
        });

        it("should handle negative exponent", () => {
            const a = new FieldValue(7n, 13n);
            const e = -3n;
            expect(a.pow(e)).to.deep.equal(new FieldValue(8n, 13n));
        });
    });

    describe(".smul()", () => {
        it("should multiply by zero", () => {
            const a = new FieldValue(7n, 13n);
            const b = 0n;
            expect(a.smul(b)).to.deep.equal(new FieldValue(0n, 13n));
        });

        it("should multiply scalar", () => {
            const a = new FieldValue(7n, 13n);
            const b = 3n;
            expect(a.smul(b)).to.deep.equal(new FieldValue(8n, 13n));
        });
    });

    describe(".isEven()", () => {
        it("should return true for even", () => {
            const sut = new FieldValue(2n, 7n);
            expect(sut.isEven()).to.equal(true);
        });

        it("should return false for odd", () => {
            const sut = new FieldValue(3n, 7n);
            expect(sut.isEven()).to.equal(false);
        });
    });

    describe(".neg()", () => {
        it("should return value that makes a + b = 0", () => {
            const sut = new FieldValue(3n, 7n);
            expect(sut.neg().num).to.equal(4n);
        });
    });
});
