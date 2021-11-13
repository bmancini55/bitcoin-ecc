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

    xdescribe("vectors", () => {
        for (const [idx, secret, pubkey, aux, message, sig, result, comment] of vectors.slice(1)) {
            if (secret) {
                it(`sign ${idx}: ${comment}`, () => {
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

            it(`verify ${idx}: ${comment}`, () => {
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
        it("succeed for 1", () => {
            const [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[1];
            const pubkeyBuf = Buffer.from(pubkey, "hex");
            const messageBuf = Buffer.from(message, "hex");
            const sigBuf = Buffer.from(sig, "hex");
            const ssig = SchnorrSig.fromBuf(sigBuf);
            expect(Schnorr.batchVerify([pubkeyBuf], [messageBuf], [ssig])).to.equal(true);
        });

        it("succeed for 2", () => {
            const pubkeys = [];
            const messages = [];
            const sigs = [];

            let [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[1];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[2];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            expect(Schnorr.batchVerify(pubkeys, messages, sigs)).to.equal(true);
        });

        it("succeed for 3", () => {
            const pubkeys = [];
            const messages = [];
            const sigs = [];

            let [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[1];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[2];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[3];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            expect(Schnorr.batchVerify(pubkeys, messages, sigs)).to.equal(true);
        });

        it("succeed for 4", () => {
            const pubkeys = [];
            const messages = [];
            const sigs = [];

            let [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[1];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[2];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[3];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            [idx, secret, pubkey, aux, message, sig, result, comment] = vectors[4];
            pubkeys.push(Buffer.from(pubkey, "hex"));
            messages.push(Buffer.from(message, "hex"));
            sigs.push(SchnorrSig.fromBuf(Buffer.from(sig, "hex")));

            expect(Schnorr.batchVerify(pubkeys, messages, sigs)).to.equal(true);
        });
    });
});
