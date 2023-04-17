import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"

import { METHODS } from "./methods"
import { OUTPUT_ENCODINGS } from "./encodings"
import { FlatmapFilterSchema } from "./flatmapfilter"
import { RateLimitSchema } from "./ratelimit"

/**
 * API Endpoint definition
 * @see https://www.krakend.io/docs/endpoints/
 */
const EndpointSchema = Type.Object({
  /**
   * Detailed description of this end point and what it does.
   */
  "@comment": Type.String({ default: "Enter some detail about this endpoint" }),
  /**
   * The exact string resource URL you want to expose. You can use {placeholders} to use variables when needed. URLs
   * do not support colons : in their definition. Endpoints should start with slash /. Example: /foo/{var}. If {vars} are
   * placed in the middle words, like in /var{iable} you must set in the root level disable_rest strict checking.
   * @see https://www.krakend.io/docs/endpoints/#endpoint
   * */
  endpoint: Type.String({ default: "/v1/changeme" }),
  /**
   * The method supported by this endpoint. Create multiple endpoint entries if you need different methods.
   */
  method: Type.Enum(METHODS, { default: "GET" }),
  /**
   * The duration you write in the timeout represents the whole duration of the pipe, so it counts the time all your
   * backends take to respond and the processing of all the components involved in the endpoint (the request, fetching
   * data, manipulation, etc.). Usually specified in seconds (s) or milliseconds (ms. e.g.: 2000ms or 2s). If you don’t set
   * any timeout, the timeout is taken from the entry in the service level, or to the system’s default
   * Valid duration units are: ns (nanosec.), us or µs (microsec.), ms (millisec.), s (sec.), m (minutes), h (hours).
   * @see https://www.krakend.io/docs/endpoints/#timeout
   */
  timeout: Type.String({ default: "2s" }),
  /**
   * Sets or overrides the cache headers to inform for how long the client or CDN can cache the request to this endpoint.
   * Valid duration units are: ns (nanosec.), us or µs (microsec.), ms (millisec.), s (sec.), m (minutes), h (hours).
   *@see https://www.krakend.io/docs/backends/caching/
   */
  cache_ttl: Type.Optional(Type.String()),
  /**
   * The concurrent requests are an excellent technique to improve the response times and decrease error rates by
   * requesting in parallel the same information multiple times. Yes, you make the same request to several backends
   * instead of asking to just one. When the first backend returns the information, the remaining requests are canceled.
   * @see https://www.krakend.io/docs/endpoints/#concurrent_calls
   */
  concurrent_calls: Type.Integer({ default: 1 }),
  /**
   * Defines the list of all headers allowed to reach the backend when passed. By default, KrakenD won’t pass any
   * header from the client to the backend. See headers forwarding
   * @see https://www.krakend.io/docs/endpoints/parameter-forwarding/#headers-forwarding
   */
  input_headers: Type.Array(Type.String(), {
    default: ["Origin", "Authorization", "Content-Type"],
  }),
  /**
   * Defines the exact list of quey strings parameters that are allowed to reach the backend. By default, KrakenD won’t
   * pass any query string to the backend.
   * @see https://www.krakend.io/docs/endpoints/#input_query_strings
   */
  input_query_strings: Type.Array(Type.String(), { default: [] }),
  /**
   * The gateway can work with several content types, even allowing your clients to choose how to consume the content.
   * @see https://www.krakend.io/docs/endpoints/content-types/
   */
  output_encoding: Type.Enum(OUTPUT_ENCODINGS, { default: "json" }),
  /**
   * List of all the backend objects queried for this endpoint
   * @see https://www.krakend.io/docs/backends/
   */
  backend: Type.Array(Type.Object({}), { default: [] }),
  /**
   * Configuration entries for additional components that are executed within this endpoint, during the request, response
   * or merge operations.
   */
  extra_config: Type.Object({
    proxy: Type.Object({
      /**
       * The best experience consumers can have with KrakenD API is by letting the system fetch all the data from
       * the different backends concurrently at the same time. However, there are times when you need to delay a backend
       * call until you can inject as input the result of a previous call.
       *
       * The sequential proxy allows you to chain backend requests.
       *
       * Chained calls are considered an anti-pattern
       *
       * Making use of sequential calls is considered an anti-pattern. This is because when you make a service dependent
       * on the other, you are increasing the latency of the service, decreasing its performance, and augmenting its error rate.
       *
       * For instance, if you have three backends with an error rate of 10% each when calling them in series, it produces an error rate of 27%.
       *
       * @see https://www.krakend.io/docs/endpoints/sequential-proxy/
       */
      sequential: Type.Boolean({ default: false }),
      /**
       * The flatmap middleware allows you to manipulate collections (or arrays, or lists; you name it) or to flatten objects from the response.
       *
       * While the {@link https://www.krakend.io/docs/backends/data-manipulation/ basic manipulation operations} allow you to work directly with objects, the collections require you to
       * use this flatmap component. The flatmap also will enable you to extract or move nested objects to have a customized object structure.
       *
       * When working with lists, KrakenD needs to flatten and expand array structures to objects to operate with them and vice versa. This
       * process is automatically done by the flatmap component, letting you concentrate only on the type of operation you want to execute.
       *
       * @see https://www.krakend.io/docs/backends/flatmap/
       */
      flatmap_filter: Type.Optional(Type.Array(FlatmapFilterSchema)),
      /**
       * The static proxy is an aid to clients dealing with incomplete and other types of degraded responses. When enabled, the static
       * proxy injects static data in the final response when the behavior of a backend falls in the selected strategy.
       *
       * A typical scenario is when some backend fails and the endpoint becomes incomplete, but you prefer to provide a stub response
       * for that part instead. When your application cannot handle well the degraded response, the static data comes handy.
       *
       * Another example scenario is to create an endpoint pointing to an unfinished backend where its functionality is not in
       * production yet, but your client application needs to go ahead the backend developers and start using the static responses.
       * @see https://www.krakend.io/docs/endpoints/static-proxy/
       */
      static: Type.Optional(
        Type.Object({
          strategy: Type.Union([
            Type.Literal("always"),
            Type.Literal("success"),
            Type.Literal("complete"),
            Type.Literal("errored"),
            Type.Literal("incomplete"),
          ]),
          data: Type.Union([Type.Array(Type.Any()), Type.Object({})]),
        })
      ),
    }),
    /**
     * Sets rate limits on the Endpoint for all clients
     * @see https://www.krakend.io/docs/endpoints/rate-limit/
     */
    "qos/ratelimit/router": Type.Object({ RateLimitSchema }),
    /**
     * In any endpoint, backend, or async_agent, you can define a sequence of expressions you’d
     * like to check using {@link https://github.com/google/cel-spec Google’s CEL spec } to write the conditions.
     *
     * During runtime, when an expression returns false, KrakenD aborts the execution of that layer:
     * it does not return the content or it does not perform the request (depending on the type). Otherwise,
     * KrakenD serves the content if all expressions return true.
     * @see https://www.krakend.io/docs/endpoints/common-expression-language-cel/
     */
    "validation/cel": Type.Optional(
      Type.Array(
        Type.Object({
          check_expr: Type.String(),
        })
      )
    ),
    /**
     * Scripting with Lua allows you to extend your business logic and make transformations on requests
     * and responses. The Lua module is compatible with the rest of components such as CEL, Martian, or
     * other Go plugins and middlewares.
     *
     * The introduction of Lua scripts in your Gateway does not require recompiling KrakenD, but unlike Go,
     * Lua scripts are interpreted in real-time. If you are new to Lua, see Lua Documentation.
     *
     * @see https://www.krakend.io/docs/endpoints/lua/
     */
    "modifier/lua-proxy": Type.Optional(Type.Object({})),
    /**
     * KrakenD endpoints receiving a JSON object in its body can apply automatic validations using the
     * JSON Schema vocabulary before the content passes to the backends. The json schema component allows
     * you to define validation rules on the body, type definition, or even validate the fields’ values.
     *
     * When the validation fails, KrakenD returns to the user a status code 400 (Bad Request), and only
     * if it succeeds, the backend receives the request.
     *
     * The JSON Schema configuration has to be declared at the endpoint level with the namespace object
     * validation/json-schema. KrakenD offers compatibility for the specs draft-04, draft-06 and draft-07.
     *
     * Use with POST, PUT, PATCH
     *
     * @see https://www.krakend.io/docs/endpoints/json-schema/
     */
    "validation/json-schema": Type.Optional(Type.Object({})),
  }),
})

type EndpointType = Static<typeof EndpointSchema>

export default class Endpoint {
  public config: EndpointType

  /**
   * Creates a new Endpoint
   * @param EndpointPath The path this should be registered on.  Ex: /users/{userid}
   * @param Method Which of the http methods this should be registered on
   * @param Description A detailed description of what this endpoint is used for including
   * and gotcha's or things to be aware of.
   */
  constructor(EndpointPath: string, Method: METHODS, Description: string) {
    this.config = Value.Create(EndpointSchema)
    this.config.endpoint = EndpointPath
    this.config.method = Method
    this.config["@comment"] = Description
  }

  public addBackend(): void {}

  /** Returns the JSON config file */
  public getConfig(): EndpointType {
    return this.config
  }
  public logConfig(): void {
    console.log(JSON.stringify(this.config, null, 2))
  }
}

export { METHODS, EndpointSchema, EndpointType, Endpoint }
