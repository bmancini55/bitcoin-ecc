import { expect } from "chai";
import * as util from "../../lib/util/BigIntMath";

describe("mod", () => {
    it("should perform modulus for positive integer", () => {
        expect(util.mod(12n, 5n)).to.equal(2n);
    });

    it("should perform modulus for negative integer", () => {
        expect(util.mod(-12n, 5n)).to.equal(3n);
    });
});

describe("pow", () => {
    it("small value", () => {
        expect(util.pow(2n, 2n, 13n)).to.equal(4n);
    });

    it("small value with wrapping", () => {
        expect(util.pow(3n, 3n, 5n)).to.equal(2n);
    });

    it("small value with large exponennt", () => {
        expect(
            util.pow(3n, BigInt("0xffffffffffffffffffffffffffffffff"), 5n)
        ).to.equal(2n);
    });
});
