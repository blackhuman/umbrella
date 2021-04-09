import type { BVec, Int, IVec, Mat, Prim, UVec } from "./types";

const SCALAR = [1];
const V2 = [2];
const V3 = [3];
const V4 = [4];

export const TYPE_SHAPES: Record<
    Prim | Int | "bool" | IVec | UVec | BVec | Mat,
    number[]
> = {
    bool: SCALAR,
    float: SCALAR,
    int: SCALAR,
    uint: SCALAR,
    vec2: V2,
    vec3: V3,
    vec4: V4,
    ivec2: V2,
    ivec3: V3,
    ivec4: V4,
    uvec2: V2,
    uvec3: V3,
    uvec4: V4,
    bvec2: V2,
    bvec3: V3,
    bvec4: V4,
    mat2x2: [2, 2],
    mat2x3: [2, 3],
    mat2x4: [2, 4],
    mat3x3: [3, 3],
    mat3x2: [3, 2],
    mat3x4: [3, 4],
    mat4x4: [4, 4],
    mat4x2: [4, 2],
    mat4x3: [4, 3],
};
