import { expect } from "chai";
import { S256Point } from "../lib/S256Point";
import { Signature } from "../lib/Signature";
import { S256Secret } from "../lib/S256Secret";
import { Secp256k1 } from "../lib/Secp256k1";

describe("S256Point", () => {
    describe("constructor", () => {
        it("check order of G", () => {
            const g = S256Point.G;
            const n = Secp256k1.N;
            expect(g.smul(n)).to.deep.equal(S256Point.Infinity);
        });
    });

    describe(".verify()", () => {
        const point = new S256Point(
      BigInt("0x887387e452b8eacc4acfde10d9aaf7f6d9a0f975aabb10d006e4da568744d06c"),
      BigInt("0x61de6d95231cd89026e286df3b6ae4a894a3378e393e93a0f45b666329a0ae34"),
    ); // prettier-ignore

        it("signature 1", () => {
            const z = BigInt("0xec208baa0fc1c19f708a9ca96fdeff3ac3f230bb4a7ba4aede4942ad003c0f60"); // prettier-ignore
            const r = BigInt("0xac8d1c87e51d0d441be8b3dd5b05c8795b48875dffe00b7ffcfac23010d3a395"); // prettier-ignore
            const s = BigInt("0x68342ceff8935ededd102dd876ffd6ba72d6a427a3edb13d26eb0781cb423c4"); // prettier-ignore
            const sig = new Signature(r, s);
            expect(point.verify(z, sig)).to.equal(true);
        });

        it("signature 2", () => {
            const z = BigInt("0x7c076ff316692a3d7eb3c3bb0f8b1488cf72e1afcd929e29307032997a838a3d"); // prettier-ignore
            const r = BigInt("0xeff69ef2b1bd93a66ed5219add4fb51e11a840f404876325a1e8ffe0529a2c"); // prettier-ignore
            const s = BigInt("0xc7207fee197d27c618aea621406f6bf5ef6fca38681d82b2f06fddbdce6feab6"); // prettier-ignore
            const sig = new Signature(r, s);
            expect(point.verify(z, sig)).to.equal(true);
        });
    });

    describe("sec", () => {
        describe("uncompressed", () => {
            const tests: [S256Secret, Buffer][] = [
        [
          new S256Secret(5000n),
          Buffer.from("04ffe558e388852f0120e46af2d1b370f85854a8eb0841811ece0e3e03d282d57c315dc72890a4f10a1481c031b03b351b0dc79901ca18a00cf009dbdb157a1d10", "hex")
        ],
        [ new S256Secret(2018n**5n),
          Buffer.from("04027f3da1918455e03c46f659266a1bb5204e959db7364d2f473bdf8f0a13cc9dff87647fd023c13b4a4994f17691895806e1b40b57f4fd22581a4f46851f3b06", "hex")
        ],
        [
          new S256Secret(BigInt("0xdeadbeef12345")),
          Buffer.from("04d90cd625ee87dd38656dd95cf79f65f60f7273b67d3096e68bd81e4f5342691f842efa762fd59961d0e99803c61edba8b3e3f7dc3a341836f97733aebf987121", "hex")
        ],
      ]; // prettier-ignore

            for (const [pk, ex] of tests) {
                it(`${pk}`, () => {
                    expect(pk.point.sec(false)).to.deep.equal(ex);
                });
            }
        });

        describe("compressed", () => {
            const tests: [S256Secret, Buffer][] = [
        [
          new S256Secret(5001n),
          Buffer.from("0357a4f368868a8a6d572991e484e664810ff14c05c0fa023275251151fe0e53d1", "hex")
        ],
        [ new S256Secret(2019n**5n),
          Buffer.from("02933ec2d2b111b92737ec12f1c5d20f3233a0ad21cd8b36d0bca7a0cfa5cb8701", "hex")
        ],
        [
          new S256Secret(BigInt("0xdeadbeef54321")),
          Buffer.from("0296be5b1292f6c856b3c5654e886fc13511462059089cdf9c479623bfcbe77690", "hex")
        ],
      ]; // prettier-ignore

            for (const [pk, ex] of tests) {
                it(`${pk}`, () => {
                    expect(pk.point.sec(true)).to.deep.equal(ex);
                });
            }
        });
    });

    describe("#.parse()", () => {
        describe("uncompressed", () => {
            const tests: [Buffer, S256Secret][] = [
        [
          Buffer.from("04ffe558e388852f0120e46af2d1b370f85854a8eb0841811ece0e3e03d282d57c315dc72890a4f10a1481c031b03b351b0dc79901ca18a00cf009dbdb157a1d10", "hex"),
          new S256Secret(5000n),
        ],
        [
          Buffer.from("04027f3da1918455e03c46f659266a1bb5204e959db7364d2f473bdf8f0a13cc9dff87647fd023c13b4a4994f17691895806e1b40b57f4fd22581a4f46851f3b06", "hex"),
          new S256Secret(2018n**5n),
        ],
        [
          Buffer.from("04d90cd625ee87dd38656dd95cf79f65f60f7273b67d3096e68bd81e4f5342691f842efa762fd59961d0e99803c61edba8b3e3f7dc3a341836f97733aebf987121", "hex"),
          new S256Secret(BigInt("0xdeadbeef12345")),
        ],
      ]; // prettier-ignore

            for (const [buf, ex] of tests) {
                it(`${buf.toString("hex")}`, () => {
                    expect(S256Point.parse(buf)).to.deep.equal(ex.point);
                });
            }
        });
        describe("compressed", () => {
            const tests: [Buffer, S256Secret][] = [
        [
          Buffer.from("0357a4f368868a8a6d572991e484e664810ff14c05c0fa023275251151fe0e53d1", "hex"),
          new S256Secret(5001n),
        ],
        [
          Buffer.from("02933ec2d2b111b92737ec12f1c5d20f3233a0ad21cd8b36d0bca7a0cfa5cb8701", "hex"),
          new S256Secret(2019n**5n),
        ],
        [
          Buffer.from("0296be5b1292f6c856b3c5654e886fc13511462059089cdf9c479623bfcbe77690", "hex"),
          new S256Secret(BigInt("0xdeadbeef54321")),
        ],
      ]; // prettier-ignore

            for (const [buf, ex] of tests) {
                it(`${buf.toString("hex")}`, () => {
                    expect(S256Point.parse(buf)).to.deep.equal(ex.point);
                });
            }
        });
    });
});
