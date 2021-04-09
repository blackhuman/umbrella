import {
    defn,
    indexMat,
    mat3x3,
    mat4x4,
    ret,
    vec3,
    vec4,
} from "@thi.ng/shader-ast";

export const m22ToM33 = defn("mat3x3", "m22ToM33", ["mat2x2"], (m) => {
    return [
        ret(mat3x3(vec3(indexMat(m, 0), 0), vec3(indexMat(m, 1), 0), vec3())),
    ];
});

export const m33ToM44 = defn("mat4x4", "m33ToM44", ["mat3x3"], (m) => {
    return [
        ret(
            mat4x4(
                vec4(indexMat(m, 0), 0),
                vec4(indexMat(m, 1), 0),
                vec4(indexMat(m, 2), 0),
                vec4()
            )
        ),
    ];
});
