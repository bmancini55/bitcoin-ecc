import { expect } from "chai";
import { EcdsaSig } from "../lib/EcdsaSig";
import crypto from "crypto";
import { bigFromBuf } from "../lib/util/BigIntUtil";
import { Ecdsa } from "../lib/Ecdsa";
import { Secp256k1 } from "../lib/Secp256k1";

describe("Signature", () => {
    describe("sign", () => {
        it("creates valid sig", () => {
            const secret = bigFromBuf(crypto.randomBytes(32));
            const point = Secp256k1.pointFromSecret(secret);
            const z = bigFromBuf(crypto.randomBytes(32));
            const sig = Ecdsa.sign(secret, z);
            expect(Ecdsa.verify(point, z, sig)).to.equal(true);
        });
    });

    describe("der()", () => {
        it("encodes", () => {
            const r = BigInt("0x37206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c6"); // prettier-ignore
            const s = BigInt("0x8ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec"); // prettier-ignore
            const sig = new EcdsaSig(r, s);
            expect(sig.der().toString("hex")).to.deep.equal(
                "3045022037206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c60221008ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec"
            );
        });
    });

    describe(".parse()", () => {
        it("decodes", () => {
            const buf = Buffer.from("3045022037206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c60221008ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec", "hex"); // prettier-ignore
            const sig = EcdsaSig.parse(buf);
            expect(sig.r).to.equal(BigInt("0x37206a0610995c58074999cb9767b87af4c4978db68c06e8e6e81d282047a7c6")); // prettier-ignore
            expect(sig.s).to.equal(BigInt("0x8ca63759c1157ebeaec0d03cecca119fc9a75bf8e6d0fa65c841c8e2738cdaec")); // prettier-ignore
        });
    });
});
