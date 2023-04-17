import { Static, Type } from "@sinclair/typebox"

/**
 * Rate limiter for a backend service call
 */
export const RateLimitSchema = Type.Object({
  /**
   * The capacity according to the token bucket algorithm with a bucket capacity == tokens added per second so
   * KrakenD is able to allow some bursting on the request rates. Recommended value is capacity == max_rate.
   * @see https://www.krakend.io/docs/backends/rate-limit/
   * @see https://www.krakend.io/docs/throttling/token-bucket/
   */
  capacity: Type.Integer({ default: 1 }),
  /**
   * Number of tokens you can store in the Token Bucket for each individual user. Traduces into maximum
   * concurrent requests this endpoint will accept for the connected user. The client is defined by the strategy field.
   * The client_max_rate keeps a counter for every client and endpoint.
   */
  client_capacity: Type.Optional(Type.Integer()),
  /**
   * Number of tokens added per second to the Token Bucket for each individual user (user quota). Use decimals for
   * per-hour and per-minute strategies. The remaining tokens for a user are the requests per second a specific user
   * can do. The client is defined by strategy. Instead of counting all the connections to the endpoint as the option
   * above, the client_max_rate keeps a counter for every client and endpoint. Keep in mind that every KrakenD instance
   * keeps its counters in memory for every single client.
   */
  client_max_rate: Type.Optional(Type.Number()),
  /**
   * Available when using client_max_rate. Sets the header containing the user identification (e.g., Authorization) or
   * IP (e.g.,X-Original-Forwarded-For). When the header contains a list of space-separated IPs, it will take the IP from
   * the client that hit the first trusted proxy.
   */
  key: Type.Optional(Type.String()),
  /**
   * Maximum requests per second you want to accept in this backend. Use decimals for per-hour and per-minute strategies.
   */
  max_rate: Type.Number({ default: 1 }),
  /**
   * Available when using client_max_rate. Sets the strategy you will use to set client counters. Choose ip when the
   * restrictions apply to the client’s IP address, or set it to header when there is a header that identifies a user
   * uniquely. That header must be defined with the key entry.
   */
  strategy: Type.Optional(
    Type.Union([Type.Literal("ip"), Type.Literal("header")])
  ),
})
