import { Static, Type } from "@sinclair/typebox"

enum METHODS {
  "GET",
  "POST",
  "PATCH",
  "PUT",
  "DELETE",
}

enum OUTPUT_ENCODINGS {
  "json",
  "json-collection",
  "fast-json",
  "xml",
  "negotiate",
  "string",
  "no-op",
}

/**
 * API Endpoint definition
 * @see https://www.krakend.io/docs/endpoints/
 */
const EndpointSchema = Type.Object({
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
  concurrent_calls: Type.Number({ default: 1 }),
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
  extra_config: Type.Object({}),
})

type EndpointType = Static<typeof EndpointSchema>

class Endpoint {
  constructor() {}
}

export { METHODS, EndpointSchema, EndpointType }
