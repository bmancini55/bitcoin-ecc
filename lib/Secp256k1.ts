import { Curve } from "./Curve";

export const Secp256k1 = new Curve(
    2n ** 256n - 2n ** 32n - 977n,
    0n,
    7n,
    0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n,
    0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
    0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n
);
