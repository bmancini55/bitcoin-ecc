import { expect } from "chai";
import { EcdsaSig } from "../lib/EcdsaSig";
import { Secp256k1 } from "../lib/Secp256k1";
import { Ecdsa } from "../lib/Ecdsa";
import { CurvePoint } from "../lib/CurvePoint";
import { CurveScalar } from "../lib/CurveScalar";
import { SecCodec } from "../lib/SecCodec";
import { bigToHex } from "../lib/util/BigIntUtil";

describe("Ecdsa", () => {
    describe(".verify()", () => {
        const point = new CurvePoint(
            Secp256k1,
            0x887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06cn,
            0x61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34n
        );

        it("signature 1", () => {
            const z = BigInt("0xec208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60"); // prettier-ignore
            const r = BigInt("0xac8d1c87e51d0d441be8b3dd5b05c8795b48875dffe00b7ffcfac23010d3a395"); // prettier-ignore
            const s = BigInt("0x68342ceff8935ededd102dd876ffd6ba72d6a427a3edb13d26eb0781cb423c4"); // prettier-ignore
            const sig = new EcdsaSig(r, s);
            expect(Ecdsa.verify(point, z, sig)).to.equal(true);
        });

        it("signature 2", () => {
            const z = BigInt("0x7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d"); // prettier-ignore
            const r = BigInt("0xeff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c"); // prettier-ignore
            const s = BigInt("0xc7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6"); // prettier-ignore
            const sig = new EcdsaSig(r, s);
            expect(Ecdsa.verify(point, z, sig)).to.equal(true);
        });
    });

    describe("malleability", () => {
        it("eG=(x,y) and (n-e)G=(x,p-y)", () => {
            const prvkey1 = 1n;
            const prvkey2 = Secp256k1.N - 1n;

            const pubkey1 = Secp256k1.pubPoint(prvkey1);
            const pubkey2 = Secp256k1.pubPoint(prvkey2);

            expect(pubkey1.x).to.equal(pubkey2.x);
            expect(pubkey1.y).to.equal(Secp256k1.P - pubkey2.y);
        });

        it("(r,s) === (r,N-s)", () => {
            const z = 2n;
            const privkey = 1n;
            const pubkey = Secp256k1.pubPoint(privkey);

            const sig1 = Ecdsa.sign(privkey, z, false);
            const sig2 = new EcdsaSig(sig1.r, Secp256k1.N - sig1.s);

            expect(Ecdsa.verify(pubkey, z, sig1)).to.equal(true);
            expect(Ecdsa.verify(pubkey, z, sig2)).to.equal(true);
            expect(sig1.s).to.equal(Secp256k1.N - sig2.s);
        });
    });
});
