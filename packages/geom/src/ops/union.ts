import { IObjectOf } from "@thi.ng/api";
import { defmulti, Implementation2 } from "@thi.ng/defmulti";
import { IShape, Type } from "@thi.ng/geom-api";
import { AABB, Rect } from "../api";
import { dispatch } from "../internal/dispatch";
import { unionBounds } from "../internal/union-bounds";

export const union = defmulti<IShape, IShape, IShape[]>(dispatch);

union.addAll(<IObjectOf<Implementation2<unknown, unknown, IShape[]>>>{
    [Type.AABB]: (a: AABB, b: AABB) => [
        new AABB(...unionBounds(a.pos, a.size, b.pos, b.size))
    ],

    [Type.RECT]: (a: Rect, b: Rect) => [
        new Rect(...unionBounds(a.pos, a.size, b.pos, b.size))
    ]
});
