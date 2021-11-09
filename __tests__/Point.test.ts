import { expect } from "chai";
import { IntValue } from "../lib/IntValue";
import { Point } from "../lib/Point";
import { FieldValue } from "../lib/FieldValue";

export const r = (val: bigint | number) => new IntValue(BigInt(val));

describe("Point", () => {
    describe("real number", () => {
        describe("constructor", () => {
            it("should throw when point not on curve", () => {
                expect(
                    () => new Point<IntValue>(r(-1n), r(-2n), r(5n), r(7n))
                ).to.throw();
            });
            it("should support infinity", () => {
                const i = Point.infinity<IntValue>(r(5n), r(7n));
                expect(i.x).to.equal(undefined);
                expect(i.y).to.equal(undefined);
            });
        });

        describe(".eq()", () => {
            it("should return true when identical", () => {
                const a = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                const b = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                expect(a.eq(b)).to.equal(true);
            });

            it("should return true when both infinity", () => {
                const a = Point.infinity<IntValue>(r(5n), r(7n));
                const b = Point.infinity<IntValue>(r(5n), r(7n));
                expect(a.eq(b)).to.equal(true);
            });

            it("should return false when not other value", () => {
                const a = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                const b = undefined;
                expect(a.eq(b)).to.equal(false);
            });

            it("should return false", () => {
                const a = Point.infinity<IntValue>(r(5n), r(7n));
                const b = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                expect(a.eq(b)).to.equal(false);
            });

            it("should return false", () => {
                const a = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                const b = Point.infinity<IntValue>(r(5n), r(7n));
                expect(a.eq(b)).to.equal(false);
            });
        });

        describe(".onCurve()", () => {
            it("should return false", () => {
                const a = Point.infinity<IntValue>(r(5n), r(7n));
                expect(a.onCurve(r(2n), r(4n))).to.equal(false);
            });

            it("should return true", () => {
                const a = Point.infinity<IntValue>(r(5n), r(7n));
                expect(a.onCurve(r(18n), r(77n))).to.equal(true);
            });
        });

        describe(".add()", () => {
            it("should return other when I am inverse", () => {
                const a = Point.infinity<IntValue>(r(5n), r(7n));
                const b = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                expect(a.add(b)).to.deep.equal(b);
            });

            it("should return me when other is inverse", () => {
                const a = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                const b = Point.infinity<IntValue>(r(5n), r(7n));
                expect(a.add(b)).to.deep.equal(a);
            });

            it("should return infinity when additive inverse", () => {
                const a = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                const b = new Point<IntValue>(r(-1n), r(1n), r(5n), r(7n));
                expect(a.add(b)).to.deep.equal(
                    Point.infinity<IntValue>(r(5n), r(7n))
                );
            });

            it("when x1 !== x2", () => {
                const a = new Point<IntValue>(r(-1n), r(-1n), r(5n), r(7n));
                const b = new Point<IntValue>(r(2n), r(5n), r(5n), r(7n));
                expect(a.add(b)).to.deep.equal(
                    new Point<IntValue>(r(3n), r(-7n), r(5n), r(7n))
                );
            });

            it("when p1 === p2", () => {
                const a = new Point<IntValue>(r(-1n), r(1n), r(5n), r(7n));
                const b = new Point<IntValue>(r(-1n), r(1n), r(5n), r(7n));
                expect(a.add(b)).to.deep.equal(
                    new Point<IntValue>(r(18n), r(-77n), r(5n), r(7n))
                );
            });

            it("when vertical tangent", () => {
                const a = new Point<IntValue>(r(-1n), r(0n), r(6n), r(7n));
                const b = new Point<IntValue>(r(-1n), r(0n), r(6n), r(7n));
                expect(a.add(b)).to.deep.equal(
                    Point.infinity<IntValue>(r(6n), r(7n))
                );
            });
        });
    });

    describe("finite field", () => {
        describe("constructor", () => {
            const prime = 223n;
            const a = new FieldValue(0n, prime);
            const b = new FieldValue(7n, prime);

            const valid = [
                [192n, 105n],
                [17n, 56n],
                [1n, 193n],
            ];

            for (const [xraw, yraw] of valid) {
                it(`valid (${xraw}, ${yraw})`, () => {
                    const x = new FieldValue(xraw, prime);
                    const y = new FieldValue(yraw, prime);
                    expect(() => new Point(x, y, a, b)).to.not.throw();
                });
            }

            const invalid = [
                [200n, 119n],
                [42n, 99n],
            ];

            for (const [xraw, yraw] of invalid) {
                it(`invalid (${xraw}, ${yraw})`, () => {
                    const x = new FieldValue(xraw, prime);
                    const y = new FieldValue(yraw, prime);
                    expect(() => new Point(x, y, a, b)).to.throw();
                });
            }
        });

        describe(".add()", () => {
            const prime = 223n;
            const a = new FieldValue(0n, prime);
            const b = new FieldValue(7n, prime);

            it("should add points", () => {
                const x1 = new FieldValue(192n, prime);
                const y1 = new FieldValue(105n, prime);
                const x2 = new FieldValue(17n, prime);
                const y2 = new FieldValue(56n, prime);
                const p1 = new Point(x1, y1, a, b);
                const p2 = new Point(x2, y2, a, b);
                expect(p1.add(p2)).to.deep.equal(
                    new Point(
                        new FieldValue(170n, prime),
                        new FieldValue(142n, prime),
                        a,
                        b
                    )
                );
            });

            it("should add points", () => {
                const x1 = new FieldValue(170n, prime);
                const y1 = new FieldValue(142n, prime);
                const x2 = new FieldValue(60n, prime);
                const y2 = new FieldValue(139n, prime);
                const p1 = new Point(x1, y1, a, b);
                const p2 = new Point(x2, y2, a, b);
                expect(p1.add(p2)).to.deep.equal(
                    new Point(
                        new FieldValue(220n, prime),
                        new FieldValue(181n, prime),
                        a,
                        b
                    )
                );
            });

            it("should add points", () => {
                const x1 = new FieldValue(47n, prime);
                const y1 = new FieldValue(71n, prime);
                const x2 = new FieldValue(17n, prime);
                const y2 = new FieldValue(56n, prime);
                const p1 = new Point(x1, y1, a, b);
                const p2 = new Point(x2, y2, a, b);
                expect(p1.add(p2)).to.deep.equal(
                    new Point(
                        new FieldValue(215n, prime),
                        new FieldValue(68n, prime),
                        a,
                        b
                    )
                );
            });

            it("should add points", () => {
                const x1 = new FieldValue(143n, prime);
                const y1 = new FieldValue(98n, prime);
                const x2 = new FieldValue(76n, prime);
                const y2 = new FieldValue(66n, prime);
                const p1 = new Point(x1, y1, a, b);
                const p2 = new Point(x2, y2, a, b);
                expect(p1.add(p2)).to.deep.equal(
                    new Point(
                        new FieldValue(47n, prime),
                        new FieldValue(71n, prime),
                        a,
                        b
                    )
                );
            });
        });

        describe(".smul()", () => {
            const prime = 223n;
            const a = new FieldValue(0n, prime);
            const b = new FieldValue(7n, prime);
            const x = new FieldValue(47n, prime);
            const y = new FieldValue(71n, prime);

            const tests = [
                [1n, [47n, 71n]],
                [2n, [36n, 111n]],
                [10n, [154n, 150n]],
                [16n, [126n, 127n]],
                [20n, [47n, 152n]],
            ];

            for (const [scalar, ex] of tests) {
                it(`scalar ${scalar} eqs ${ex}`, () => {
                    const p1 = new Point<FieldValue>(x, y, a, b);
                    const p2 = p1.smul(scalar as bigint);
                    expect((p2.x as FieldValue).num).to.equal(ex[0]);
                    expect((p2.y as FieldValue).num).to.equal(ex[1]);
                });
            }
        });
    });

    describe("256 bit size", () => {
        const gx = BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"); // prettier-ignore
        const gy = BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"); // prettier-ignore
        const p = 2n ** 256n - 2n ** 32n - 977n;
        const n = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"); // prettier-ignore
        const x = new FieldValue(gx, p);
        const y = new FieldValue(gy, p);
        const seven = new FieldValue(7n, p);
        const zero = new FieldValue(0n, p);
        const G = new Point(x, y, zero, seven);

        describe(".smul()", () => {
            it("large scalar multiple", () => {
                expect(G.smul(n)).to.deep.equal(Point.infinity(zero, seven));
            });
        });
    });
});
