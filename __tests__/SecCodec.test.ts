import { expect } from "chai";
import { Secp256k1 } from "../lib/Secp256k1";
import { SecCodec } from "../lib/SecCodec";

describe("SecCodec", () => {
    describe("#.encode()", () => {
        describe("uncompressed", () => {
            const tests: [bigint, Buffer][] = [
                [
                    5000n,
                    Buffer.from("04ffe558e388852f0120e46af2d1b370f85854a8eb0841811ece0e3e03d282d57c315dc72890a4f10a1481c031b03b351b0dc79901ca18a00cf009dbdb157a1d10", "hex")
                ],
                [
                    2018n**5n,
                    Buffer.from("04027f3da1918455e03c46f659266a1bb5204e959db7364d2f473bdf8f0a13cc9dff87647fd023c13b4a4994f17691895806e1b40b57f4fd22581a4f46851f3b06", "hex")
                ],
                [
                    0xdeadbeef12345n,
                    Buffer.from("04d90cd625ee87dd38656dd95cf79f65f60f7273b67d3096e68bd81e4f5342691f842efa762fd59961d0e99803c61edba8b3e3f7dc3a341836f97733aebf987121", "hex")
                ],
            ]; // prettier-ignore

            for (const [secret, ex] of tests) {
                it(`${secret}`, () => {
                    const point = Secp256k1.pubPoint(secret);
                    expect(SecCodec.encode(point, false)).to.deep.equal(ex);
                });
            }
        });

        describe("compressed", () => {
            const tests: [bigint, Buffer][] = [
                [
                    5001n,
                    Buffer.from("0357a4f368868a8a6d572991e484e664810ff14c05c0fa023275251151fe0e53d1", "hex")
                ],
                [
                    2019n**5n,
                    Buffer.from("02933ec2d2b111b92737ec12f1c5d20f3233a0ad21cd8b36d0bca7a0cfa5cb8701", "hex")
                ],
                [
                    0xdeadbeef54321n,
                    Buffer.from("0296be5b1292f6c856b3c5654e886fc13511462059089cdf9c479623bfcbe77690", "hex")
                ],
            ]; // prettier-ignore

            for (const [secret, ex] of tests) {
                it(`${secret}`, () => {
                    const point = Secp256k1.pubPoint(secret);
                    expect(SecCodec.encode(point, true)).to.deep.equal(ex);
                });
            }
        });
    });

    describe("#.decode()", () => {
        describe("uncompressed", () => {
            const tests: [Buffer, bigint][] = [
                [
                    Buffer.from("04ffe558e388852f0120e46af2d1b370f85854a8eb0841811ece0e3e03d282d57c315dc72890a4f10a1481c031b03b351b0dc79901ca18a00cf009dbdb157a1d10", "hex"),
                    5000n,
                ],
                [
                    Buffer.from("04027f3da1918455e03c46f659266a1bb5204e959db7364d2f473bdf8f0a13cc9dff87647fd023c13b4a4994f17691895806e1b40b57f4fd22581a4f46851f3b06", "hex"),
                    2018n**5n,
                ],
                [
                    Buffer.from("04d90cd625ee87dd38656dd95cf79f65f60f7273b67d3096e68bd81e4f5342691f842efa762fd59961d0e99803c61edba8b3e3f7dc3a341836f97733aebf987121", "hex"),
                    BigInt("0xdeadbeef12345"),
                ],
            ]; // prettier-ignore

            for (const [buf, secret] of tests) {
                it(`${buf.toString("hex")}`, () => {
                    const point = Secp256k1.pubPoint(secret);
                    expect(SecCodec.decode(buf)).to.deep.equal(point);
                });
            }
        });
        describe("compressed", () => {
            const tests: [Buffer, bigint][] = [
                [
                    Buffer.from("0357a4f368868a8a6d572991e484e664810ff14c05c0fa023275251151fe0e53d1", "hex"),
                    5001n,
                ],
                [
                    Buffer.from("02933ec2d2b111b92737ec12f1c5d20f3233a0ad21cd8b36d0bca7a0cfa5cb8701", "hex"),
                    2019n**5n,
                ],
                [
                    Buffer.from("0296be5b1292f6c856b3c5654e886fc13511462059089cdf9c479623bfcbe77690", "hex"),
                    0xdeadbeef54321n,
                ],
            ]; // prettier-ignore

            for (const [buf, secret] of tests) {
                it(`${buf.toString("hex")}`, () => {
                    const point = Secp256k1.pubPoint(secret);
                    expect(SecCodec.decode(buf)).to.deep.equal(point);
                });
            }
        });
    });
});
