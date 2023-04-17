import { Static, Type } from "@sinclair/typebox"

import { HASHING_ALGORITHMS } from "./hashalgorithms"

/**
 * JWT validation for a route
 */
export const AuthValidatorSchema = Type.Object({
  /**
   * The hashing algorithm used by the token issuer.
   * @see https://www.krakend.io/docs/authorization/jwt-validation/#alg
   */
  alg: Type.Enum(HASHING_ALGORITHMS, { default: "RS256" }),
  /**
   * Reject tokens that do not contain ALL audiences declared in the list.
   * @see https://www.krakend.io/docs/authorization/jwt-validation/#audience
   */
  audience: Type.Array(Type.String(), { default: ["http://api.example.com"] }),
  /**
   * Set this value to true (recommended) to stop downloading keys on every request and store them
   * in memory for the next cache_duration period and avoid hammering the key server, as recommended
   * for performance. Do not use this flag when using jwk_local_ca
   * @see https://www.krakend.io/docs/authorization/jwt-validation/#cache
   */
  cache: Type.Boolean({ default: true }),
  /**
   * The cache duration when the cache is enabled. Value in seconds, defaults to 15 minutes.
   * @see https://www.krakend.io/docs/authorization/jwt-validation/#cache_duration
   */
  cache_duration: Type.Integer({ default: 900 }),

  roles_key: Type.Optional(Type.String()),
  roles: Type.Optional(Type.Array(Type.String())),
  jwk_url: Type.String({
    default: "http://api.example.com/.well-known/jwks.json",
  }),
})
