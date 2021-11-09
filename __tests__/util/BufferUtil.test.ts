import { expect } from "chai";
import { rstrip } from "../../lib/util/BufferUtil";

describe("Buffer Utilities", () => {
    describe(".rstrip()", () => {
        it("strips all", () => {
            const buf = Buffer.alloc(8);
            const res = rstrip(buf, 0);
            expect(res.toString("hex")).to.equal("");
        });
        it("strips single", () => {
            const buf = Buffer.from("01020300", "hex");
            const res = rstrip(buf, 0);
            expect(res.toString("hex")).to.equal("010203");
        });

        it("strips multiple", () => {
            const buf = Buffer.from("01020000", "hex");
            const res = rstrip(buf, 0);
            expect(res.toString("hex")).to.equal("0102");
        });
    });
});
