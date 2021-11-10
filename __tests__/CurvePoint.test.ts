import { expect } from "chai";
import { CurvePoint } from "../lib/CurvePoint";

// describe("CurvePoint", () => {
//     describe("finite field", () => {
//         describe("constructor", () => {
//             const prime = 223n;
//             const a = 0n;
//             const b = 7n;

//             const valid = [
//                 [192n, 105n],
//                 [17n, 56n],
//                 [1n, 193n],
//             ];

//             for (const [x, y] of valid) {
//                 it(`valid (${x}, ${y})`, () => {
//                     expect(() => new CurvePoint(x, y)).to.not.throw();
//                 });
//             }

//             const invalid = [
//                 [200n, 119n],
//                 [42n, 99n],
//             ];

//             for (const [xraw, yraw] of invalid) {
//                 it(`invalid (${xraw}, ${yraw})`, () => {
//                     const x = new FieldValue(xraw, prime);
//                     const y = new FieldValue(yraw, prime);
//                     expect(() => new Point(x, y, a, b)).to.throw();
//                 });
//             }
//         });

//         describe(".add()", () => {
//             const prime = 223n;
//             const a = new FieldValue(0n, prime);
//             const b = new FieldValue(7n, prime);

//             it("should add points", () => {
//                 const x1 = new FieldValue(192n, prime);
//                 const y1 = new FieldValue(105n, prime);
//                 const x2 = new FieldValue(17n, prime);
//                 const y2 = new FieldValue(56n, prime);
//                 const p1 = new Point(x1, y1, a, b);
//                 const p2 = new Point(x2, y2, a, b);
//                 expect(p1.add(p2)).to.deep.equal(
//                     new Point(new FieldValue(170n, prime), new FieldValue(142n, prime), a, b)
//                 );
//             });

//             it("should add points", () => {
//                 const x1 = new FieldValue(170n, prime);
//                 const y1 = new FieldValue(142n, prime);
//                 const x2 = new FieldValue(60n, prime);
//                 const y2 = new FieldValue(139n, prime);
//                 const p1 = new Point(x1, y1, a, b);
//                 const p2 = new Point(x2, y2, a, b);
//                 expect(p1.add(p2)).to.deep.equal(
//                     new Point(new FieldValue(220n, prime), new FieldValue(181n, prime), a, b)
//                 );
//             });

//             it("should add points", () => {
//                 const x1 = new FieldValue(47n, prime);
//                 const y1 = new FieldValue(71n, prime);
//                 const x2 = new FieldValue(17n, prime);
//                 const y2 = new FieldValue(56n, prime);
//                 const p1 = new Point(x1, y1, a, b);
//                 const p2 = new Point(x2, y2, a, b);
//                 expect(p1.add(p2)).to.deep.equal(
//                     new Point(new FieldValue(215n, prime), new FieldValue(68n, prime), a, b)
//                 );
//             });

//             it("should add points", () => {
//                 const x1 = new FieldValue(143n, prime);
//                 const y1 = new FieldValue(98n, prime);
//                 const x2 = new FieldValue(76n, prime);
//                 const y2 = new FieldValue(66n, prime);
//                 const p1 = new Point(x1, y1, a, b);
//                 const p2 = new Point(x2, y2, a, b);
//                 expect(p1.add(p2)).to.deep.equal(
//                     new Point(new FieldValue(47n, prime), new FieldValue(71n, prime), a, b)
//                 );
//             });
//         });

//         describe(".smul()", () => {
//             const prime = 223n;
//             const a = new FieldValue(0n, prime);
//             const b = new FieldValue(7n, prime);
//             const x = new FieldValue(47n, prime);
//             const y = new FieldValue(71n, prime);

//             const tests = [
//                 [1n, [47n, 71n]],
//                 [2n, [36n, 111n]],
//                 [10n, [154n, 150n]],
//                 [16n, [126n, 127n]],
//                 [20n, [47n, 152n]],
//             ];

//             for (const [scalar, ex] of tests) {
//                 it(`scalar ${scalar} eqs ${ex}`, () => {
//                     const p1 = new Point<FieldValue>(x, y, a, b);
//                     const p2 = p1.smul(scalar as bigint);
//                     expect((p2.x as FieldValue).num).to.equal(ex[0]);
//                     expect((p2.y as FieldValue).num).to.equal(ex[1]);
//                 });
//             }
//         });
//     });

//     describe("256 bit size", () => {
//         const gx = BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"); // prettier-ignore
//         const gy = BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8"); // prettier-ignore
//         const p = 2n ** 256n - 2n ** 32n - 977n;
//         const n = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"); // prettier-ignore
//         const x = new FieldValue(gx, p);
//         const y = new FieldValue(gy, p);
//         const seven = new FieldValue(7n, p);
//         const zero = new FieldValue(0n, p);
//         const G = new Point(x, y, zero, seven);

//         describe(".smul()", () => {
//             it("large scalar multiple", () => {
//                 expect(G.smul(n)).to.deep.equal(Point.infinity(zero, seven));
//             });
//         });
//     });
// });
