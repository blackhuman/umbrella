import { peek } from "@thi.ng/arrays/peek";
import { polyline as gPolyline } from "@thi.ng/geom/polyline";
import { resample } from "@thi.ng/geom/resample";
import { vertices } from "@thi.ng/geom/vertices";
import { circle } from "@thi.ng/hiccup-svg/circle";
import { group } from "@thi.ng/hiccup-svg/group";
import { polyline } from "@thi.ng/hiccup-svg/polyline";
import { svg } from "@thi.ng/hiccup-svg/svg";
import { type GestureEvent, gestureStream } from "@thi.ng/rstream-gestures";
import { fromIterable } from "@thi.ng/rstream/iterable";
import { merge } from "@thi.ng/rstream/merge";
import { sync } from "@thi.ng/rstream/sync";
import { updateDOM } from "@thi.ng/transducers-hdom";
import { comp } from "@thi.ng/transducers/comp";
import { filter } from "@thi.ng/transducers/filter";
import { map } from "@thi.ng/transducers/map";
import { multiplexObj } from "@thi.ng/transducers/multiplex-obj";
import { noop } from "@thi.ng/transducers/noop";
import { partition } from "@thi.ng/transducers/partition";
import { push } from "@thi.ng/transducers/push";
import { transduce } from "@thi.ng/transducers/transduce";
import type { Vec } from "@thi.ng/vectors";
import { angleBetween2 } from "@thi.ng/vectors/angle-between";
import { mixN2 } from "@thi.ng/vectors/mixn";
import { sub2 } from "@thi.ng/vectors/sub";
import { CTA } from "./config";

/**
 * Root component function, attached to rstream (see further below).
 * Receives raw & processed gesture paths to visualize as SVG.
 *
 * @param raw - 
 * @param processed - 
 */
const app = ({
    raw,
    processed,
}: {
    raw: Vec[];
    processed: { path: Vec[]; corners: Vec[] };
}) => [
    "div",
    svg(
        {
            width: window.innerWidth,
            height: window.innerHeight,
            stroke: "none",
            fill: "none",
        },
        path(raw || [], processed.path, processed.corners || [])
    ),
    [
        "div.fixed.top-0.left-0.ma3",
        ["div", `raw: ${(raw && raw.length) || 0}`],
        ["div", `resampled: ${(processed && processed.path.length) || 0}`],
        ["div", `corners: ${(processed && processed.corners.length) || 0}`],
    ],
];

/**
 * Gesture visualization component. Creates an SVG group of shape
 * elements & iterables.
 *
 * @param raw - aw gesture path
 * @param sampled - esampled path
 * @param corners - rray of corner points
 */
const path = (raw: Vec[], sampled: Vec[], corners: Vec[]) =>
    group(
        { __diff: false },
        polyline(raw, { stroke: "#444" }),
        map((p) => circle(p, 2, { fill: "#444" }), raw),
        polyline(sampled, { stroke: "#fff" }),
        map((p) => circle(p, 2, { fill: "#fff" }), sampled),
        map((p) => circle(p, 6, { fill: "#cf0" }), corners),
        circle(sampled[0], 6, { fill: "#f0c" }),
        circle(peek(sampled), 6, { fill: "#0cf" })
    );

/**
 * Re-samples given polyline at given uniform distance. Returns array of
 * interpolated points (does not modify original).
 *
 * @param step - ample distance
 * @param pts - 
 */
const sampleUniform = (step: number, pts: Vec[]) =>
    vertices(resample(gPolyline(pts), { dist: step }));

/**
 * Applies low-pass filter to given polyline. I.e. Each point in the
 * array (apart from the 1st) is interpolated towards the last point in
 * the result array. Returns new array of smoothed points.
 *
 * @param path - 
 */
const smoothPath = (smooth: number, path: Vec[]) => {
    const res: Vec[] = [path[0]];
    for (let i = 1, n = path.length; i < n; i++) {
        res.push(mixN2([], path[i], res[i - 1], smooth));
    }
    return res;
};

/**
 * Corner detector HOF. Returns new function which takes 3 successive
 * path points and returns true if the middle point is a corner.
 *
 * @param thresh - ormalized angle threshold
 */
const isCorner =
    (thresh: number) =>
    ([a, b, c]: Vec[]) =>
        angleBetween2(sub2([], b, a), sub2([], b, c), true) < thresh;

/**
 * Gesture event processor. Collects gesture event positions into an
 * array of Vec2.
 */
const collectPath = () => {
    let pts: Vec[] = [];
    return (g: GestureEvent) => {
        console.log(g);
        switch (g.type) {
            case "start":
                pts = [g.pos];
                break;
            case "drag":
                pts.push(g.pos);
                break;
        }
        return pts;
    };
};

// gesture input stream(s)
const gesture = merge<any, any>({
    src: [
        // the initial CTA (call-to-action) gesture (see config.ts)
        // will be shown prior to first user interaction.
        // this stream only emits this one single gesture path,
        // then closes and will be removed from the stream merge
        fromIterable([CTA]),
        // mouse & touch event stream attached to document.body
        // we're filtering out move & zoom events to avoid extraneous work
        gestureStream(document.body).transform(
            filter((g) => !(g.type === "move" || g.type === "zoom")),
            map(collectPath())
        ),
    ],
});

// main gesture processor
// uses 2 inputs, both based on above `gesture` stream
// however one of them will be transformed via multi-stage transducer
// to create a resampled version and apply a corner detector
// the resulting stream will emit tuple objects of this structure:
// `{ raw: Vec2[], processed: { path: Vec2[], corners: Vec2[] } }
sync({
    src: {
        raw: gesture,
        processed: gesture.transform(
            comp(
                map((pts: Vec[]) => smoothPath(3 / 4, pts)),
                map((pts: Vec[]) => sampleUniform(20, pts)),
                multiplexObj({
                    path: noop(),
                    corners: map((pts) =>
                        transduce(
                            comp(
                                partition(3, 1),
                                filter(isCorner((Math.PI * 2) / 3)),
                                map((x) => x[1])
                            ),
                            push(),
                            pts
                        )
                    ),
                })
            )
        ),
    },
}).transform(
    // transform result tuples into HDOM components
    map(app),
    // update UI diff
    updateDOM()
);
