import { Fn, IID, IObjectOf } from "@thi.ng/api";

/**
 * A validation function to for authenticated routes. If this function
 * determines that the user is not allowed to access this route, it
 * should return nothing or a `RouteMatch` object for redirecting (e.g.
 * to a login, home page or other non-protected route). If nothing is
 * returned and no other routes can be matched, the router will
 * eventually return the configure default fallback route.
 */
export type RouteAuthenticator = (
    route: Route,
    curr: string[],
    params: any
) => RouteMatch;

/**
 * Route validator subspecs are optional and used to coerce and/or
 * validate individual route parameters.
 */
export interface RouteParamValidator {
    /**
     * Optional coercion function executed prior to validation.
     */
    coerce?: Fn<string, any>;
    /**
     * Optional arbitrary value validation. If any validator
     * returns non-true result, the currently checked route
     * becomes unmatched/invalid and the router continues
     * checking other routes.
     */
    check: Fn<any, boolean>;
}

/**
 * A Route describes an application path (possibly parameterized),
 * incl. parameter coercion, validation and overall route
 * authentication. Apart from `id` and `match` all other fields
 * are optional.
 */
export interface Route extends IID<string> {
    /**
     * Array of path components. If a value is prefixed with `?` this
     * path component will be captured under that name. E.g.
     * `["projects", "?id"]` will match any of these routes:
     *
     * - `projects/123`
     * - `projects/abcde`
     *
     * `validate` options can then be used to further restrict the
     * possible value range of the `id` value...
     */
    match: string[];

    /**
     * This object specifies coercions and validators for variable /
     * parameterized path components, e.g.
     *
     * ```
     * {
     *  id: {
     *          coerce: (x) => parseInt(x,10),
     *          validate: (x)=> x < 100
     *      }
     * }
     * ```
     *
     * This will first coerce the `id` route param to a number and then
     * only allow the route to be matched if `id < 100`.
     */
    validate?: IObjectOf<RouteParamValidator>;

    /**
     * Flag to indicate if this route should be passed to the globally
     * configured authentication function. Only matched and validated
     * routes are processed.
     */
    auth?: boolean;

    /**
     * Optional route title (passed to `RouteMatch`)
     */
    title?: string;

    /**
     * Allow route objects to be extented w/ custom data
     */
    [id: string]: any;
}

/**
 * Result object returned by a routing operation and event value for
 * `EVENT_ROUTE_CHANGE`. Contains the matched route ID and any route
 * params.
 */
export interface RouteMatch extends IID<string> {
    title?: string;

    /**
     * Matched & processed route params.
     */
    params?: any;
}

/**
 * Configuration object for `Router` instances.
 */
export interface RouterConfig {
    /**
     * An array of route specs, which are being attempted to be matched
     * in order of appearance.
     */
    routes: Route[];
    /**
     * Fallback route ID (MUST exist in `routes`), used if none of the
     * defined routes could be matched against user input, e.g. a home
     * or error page.
     */
    defaultRouteID: string;
    /**
     * Optional initial route to trigger when router starts. If given,
     * this MUST be a route without params.
     */
    initialRouteID?: string;
    /**
     * Optional route authentication function. See `RouteAuthenticator`
     * for further details. If no authenticator is given, all matched
     * routes will always succeed, regardless if a rule's `auth` flag is
     * enabled or not.
     */
    authenticator?: RouteAuthenticator;
    /**
     * Optional route path component separator. Default: `/`
     */
    separator?: string;
    /**
     * Route prefix. Default: `/`. All routes to be parsed by `route()`
     * are assumed to have this prefix. All routes returned by
     * `format()` will include this prefix.
     */
    prefix?: string;
}

export interface HTMLRouterConfig extends RouterConfig {
    /**
     * Optional flag to indicate if URL hash fragment should be used for
     * routes.
     */
    useFragment?: boolean;
}

/**
 * ID of event being triggered by `router.match()`
 */
export const EVENT_ROUTE_CHANGED = "route-changed";
export const EVENT_ROUTE_FAILED = "route-failed";
