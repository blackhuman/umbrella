import { IVector, VecOpV, VecOpVV, VecOpVN, VecOpVVV, VecOpVVN } from "./api";

/**
 * Like `mapBufferVV`, but for `VecOpV` type ops and hence only using
 * single input.
 *
 * ```
 * // 4x 2D vectors in SOA layout, i.e. [x1,x2,x3,x4,y1,y2,y3,y4]
 * buf = [1,3,5,7,2,4,6,8];
 *
 * // use `swapXY` to swizzle each vector and use AOS for output
 * res = mapBufferV(swapXY, new Vec2(), new Vec2(buf,0,4), 4, 2, 1);
 * // [ 2, 1, 4, 3, 6, 5, 8, 7 ]
 *
 * // unpack result for demonstration purposes
 * [...Vec2.iterator(res, 4)].map(v => [...v]);
 * // [ [ 2, 1 ], [ 4, 3 ], [ 6, 5 ], [ 8, 7 ] ]
 * ```
 *
 * @param op
 * @param out
 * @param a
 * @param num
 * @param so
 * @param sa
 */
export const mapBufferV = (
    op: VecOpV,
    out: IVector<any>,
    a: IVector<any>,
    num: number,
    so = out.length * out.s,
    sa = a.length * a.s) => {

    while (num-- > 0) {
        op(out, a);
        out.i += so;
        a.i += sa;
    }
    return out.buf;
};

/**
 * Like `mapBufferVV`, but for `VecOpVN` type ops and hence using
 * a single vector input buffer `a` and a scalar `n`.
 *
 * @param op
 * @param out
 * @param a
 * @param n
 * @param num
 * @param so
 * @param sa
 */
export const mapBufferVN = (
    op: VecOpVN,
    out: IVector<any>,
    a: IVector<any>,
    n: number,
    num: number,
    so = out.length * out.s,
    sa = a.length * a.s) => {

    while (num-- > 0) {
        op(out, a, n);
        out.i += so;
        a.i += sa;
    }
    return out.buf;
};

/**
 * Vec2/3/4 view based buffer transformation for `VecOpVV` type ops and
 * supporting arbitrary component and element layouts of all input and
 * output buffers. The given pre-initialized vectors MUST be separate
 * instances, are used as sliding cursors / views of their respective
 * backing buffers and will be modified as part of the transformation
 * process (though the input buffers themselves are treated as
 * immutable, unless `out` is configured to use one of the input
 * buffers).
 *
 * In each iteration `op` is called via `op(out, a, b)`, followed by
 * cursor updates to process the next vector. No bounds checking is
 * performed.
 *
 * This function returns `out`'s backing buffer.
 *
 * ```
 * // each input buffer contains 2 2D vectors, but using
 * // different strided data layouts
 * mapBufferVV(
 *   // transformation function
 *   add,
 *   // init output buffer view
 *   new Vec2(),
 *   // wrap 1st input buffer & configure offset & component stride
 *   new Vec2([1,0,2,0,0,0,0,0,3,0,4,0,0,0,0,0], 0, 2),
 *   // wrap 2nd input buffer
 *   new Vec2([0,10,0,0,20,0,0,30,0,0,40], 1, 3),
 *   2, // num vectors
 *   2, // output element stride
 *   8, // input #1 element stride
 *   6  // input #2 element stride
 * );
 * // [ 11, 22, 33, 44 ]
 * ```
 *
 * @param op
 * @param out
 * @param a
 * @param b
 * @param num
 * @param so
 * @param sa
 * @param sb
 */
export const mapBufferVV = (
    op: VecOpVV,
    out: IVector<any>,
    a: IVector<any>,
    b: IVector<any>,
    num: number,
    so = out.length * out.s,
    sa = a.length * a.s,
    sb = b.length * b.s) => {

    while (num-- > 0) {
        op(out, a, b);
        out.i += so;
        a.i += sa;
        b.i += sb;
    }
    return out.buf;
};

export const mapBufferVVV = (
    op: VecOpVVV,
    out: IVector<any>,
    a: IVector<any>,
    b: IVector<any>,
    c: IVector<any>,
    num: number,
    so = out.length * out.s,
    sa = a.length * a.s,
    sb = b.length * b.s,
    sc = c.length * c.s) => {

    while (num-- > 0) {
        op(out, a, b, c);
        out.i += so;
        a.i += sa;
        b.i += sb;
        c.i += sc;
    }
    return out.buf;
};

export const mapBufferVVN = (
    op: VecOpVVN,
    out: IVector<any>,
    a: IVector<any>,
    b: IVector<any>,
    n: number,
    num: number,
    so = out.length * out.s,
    sa = a.length * a.s,
    sb = b.length * b.s) => {

    while (num-- > 0) {
        op(out, a, b, n);
        out.i += so;
        a.i += sa;
        b.i += sb;
    }
    return out.buf;
};
