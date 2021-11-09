/**
 * Returns the modulus of a % b as a real value in the range `0` to
 * `b-1`.
 *
 * This function is reqiured because the `%` operator in JavaScript is
 * the remainder operation and not the modulus operator. The remainder
 * operator has different values for negative numbers. Negative numbers
 * are frequently encounter during subtraction. More
 * [info](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Remainder).
 *
 * @example
 * ```typescript
 * mod(12, 5) === 2;
 * mod(-12, 5) === 3;
 * ```
 *
 * @param a
 * @param b
 */
export function mod(a: bigint, b: bigint): bigint {
    return ((a % b) + b) % b;
}

/**
 * Performs fast modular exponentiation using exponentiation by squaring
 * and is suitable for operations on large numbers typically seen in
 * cryptography.
 *
 * The exponentiation `**` operator is not suitable for extremely large
 * numbers such as those used with cryptography. The naive approach for
 * exponentiation followed by a modulus results in extremely large
 * numbers that will overflow large number libraries. The use of a
 * modular exponentiation method is used to iteratively exponentiate and
 * pass through the modulus to keep the operation memory efficient.
 *
 * This version of modular exponentation is implemented using the binary
 * right-to-left method as defined in Applied Cryptograph by Bruce
 * Schneier and found on
 * [wikipedia](https://en.wikipedia.org/wiki/Modular_exponentiation#Pseudocode).
 *
 * @param base base
 * @param exp exponent
 * @param modulus modulus
 */
export function pow(base: bigint, exp: bigint, modulus: bigint): bigint {
    if (modulus === 1n) {
        return 0n;
    }

    let result = 1n;
    base = mod(base, modulus);
    while (exp > 0) {
        if (mod(exp, 2n) === 1n) {
            result = mod(result * base, modulus);
        }
        exp = exp >> 1n;
        base = mod(base * base, modulus);
    }
    return result;
}

/**
 * Returns a tuple containing the quotient and remainder when the
 * divident (num) is divided by the divisor (mod).
 * @param num divident
 * @param mod divisor
 */
export function divmod(num: bigint, mod: bigint): [bigint, bigint] {
    return [num / mod, num % mod];
}
