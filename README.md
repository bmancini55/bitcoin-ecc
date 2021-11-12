# Bitcoin ECC Demo

**This library is for demonstration purposes only!**

Implements ECDSA and Schnorr signatures on curve secp256k1 as used in
Bitcoin. This library implements ECC using the `bigint` type in
JavaScript and does not use any third party libraries for calculations.

Math primitives:

-   [FiniteField](./lib/FiniteField.ts) - defines a finite field and its
    math operations
-   [Curve](./lib/Curve.ts) - defines an elliptic curve
-   [CurvePoint](./lib/CurvePoint) - defines a point on an elliptic
    curve and its math operations

Signature schemes:

-   [ECDSA](./lib/Ecdsa.ts) - Elliptic Curve Digital Signature Algorithm
-   [Schnorr](./lib/Schnorr.ts) - Shcnorr Signature Algorithm as defined
    in [BIP340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki)
