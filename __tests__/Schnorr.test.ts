import path from "path";
import { expect } from "chai";
import { readFileSync } from "fs";
import { Schnorr } from "../lib/Schnorr";
import { SchnorrSig } from "../lib/SchnorrSig";

describe("Schnorr", () => {
    const csv = readFileSync(path.join(__dirname, "../__fixtures__/bip340_vectors.csv")).toString(
        "utf8"
    );
    const lines = csv.split("\n").filter(p => p);
    const vectors = lines.map(line => line.split(","));

    describe(".sign()", () => {
        for (const [idx, secret, pubkey, aux, message, sig, result, comment] of vectors.slice(1)) {
            if (secret) {
                it(`vector ${idx}: ${comment}`, () => {
                    const secretBuf = Buffer.from(secret, "hex");
                    const auxBuf = Buffer.from(aux, "hex");
                    const messageBuf = Buffer.from(message, "hex");
                    const sigBuf = Buffer.from(sig, "hex");

                    const result = Schnorr.sign(secretBuf, messageBuf, auxBuf);
                    const resultBuf = result.toBuffer();
                    const r = resultBuf.slice(0, 32);
                    const s = resultBuf.slice(32);
                    expect(r.toString("hex")).to.equal(sigBuf.slice(0, 32).toString("hex"));
                    expect(s.toString("hex")).to.equal(sigBuf.slice(32).toString("hex"));
                });
            }
        }
    });

    describe(".verify()", () => {
        for (const [idx, secret, pubkey, aux, message, sig, result, comment] of vectors.slice(1)) {
            it(`vector ${idx}: ${comment}`, () => {
                const pubkeyBuf = Buffer.from(pubkey, "hex");
                const messageBuf = Buffer.from(message, "hex");
                const sigBuf = Buffer.from(sig, "hex");
                const ssig = SchnorrSig.fromBuf(sigBuf);

                const resBool = result === "TRUE";
                try {
                    expect(Schnorr.verify(pubkeyBuf, messageBuf, ssig)).to.equal(resBool);
                } catch (ex) {
                    expect(resBool).to.equal(false);
                }
            });
        }
    });

    describe(".batchVerify()", () => {
        for (let num = 1; num <= 4; num++) {
            it(`batch_size=${num}`, () => {
                const sigs = [];
                const msgs = [];
                const pks = [];

                for (let i = num; i <= num; i++) {
                    const [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[i];
                    pks.push(Buffer.from(pubkey, "hex"));
                    msgs.push(Buffer.from(message, "hex"));
                    sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));
                    expect(Schnorr.batchVerify(pks, msgs, sigs)).to.equal(true);
                }
            });
        }
    });
});
