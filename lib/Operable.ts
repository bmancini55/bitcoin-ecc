/**
 * Interface that exposes standard math operations. Implementing types
 * can be used by other classes that require objects that support
 * these math operations.
 *
 * This interface and the techniques used here are required by JavaScript
 * does not support operator overloading and cannnot do things like:
 *
 * ```typescript
 * (a + b)
 * ```
 */
export interface IOperable {
    eq(other: IOperable): boolean;
    neq(other: IOperable): boolean;
    add(other: IOperable): IOperable;
    sub(other: IOperable): IOperable;
    mul(other: IOperable): IOperable;
    div(other: IOperable): IOperable;
    pow(exponent: bigint): IOperable;
    smul(scalar: bigint): IOperable;
    isEven(): boolean;
}
