import { expect } from "chai";
import * as util from "../../lib/util/BigIntUtil";

describe("BigInt", () => {
    describe(".bigToBufLE", () => {
        const tests: [bigint, Buffer][] = [
            [1n, Buffer.from([1, 0, 0, 0])],
            [16777216n, Buffer.from([0, 0, 0, 1])],
        ];
        for (const test of tests) {
            it(`${test[0]} > ${test[1].toString("hex")}`, () => {
                expect(util.bigToBufLE(test[0], 4)).to.deep.equal(test[1]);
            });
        }
    });

    describe(".bigFromBufLE", () => {
        const tests: [Buffer, bigint][] = [
            [Buffer.from([1, 0, 0, 0]), 1n],
            [Buffer.from([0, 0, 0, 1]), 16777216n],
        ];
        for (const test of tests) {
            it(`${test[0].toString("hex")} > ${test[1]}`, () => {
                expect(util.bigFromBufLE(test[0])).to.deep.equal(test[1]);
            });
        }
    });
});
