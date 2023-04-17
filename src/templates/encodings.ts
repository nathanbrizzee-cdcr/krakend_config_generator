export enum OUTPUT_ENCODINGS {
  JSON = "json",
  JSON_COLLECTION = "json-collection",
  FAST_JSON = "fast-json",
  XML = "xml",
  NEGOTIATE = "negotiate",
  STRING = "string",
  NO_OP = "no-op",
}

/**
 * Supported backend encodings
 * @see https://www.krakend.io/docs/backends/supported-encodings/
 */
export enum BACKEND_ENCODINGS {
  /**
   * JSON inside an object ({})
   * JSON inside an array/collection ([]) with "is_collection": true
   * @note
   * When hesitating whether to use safejson or json and the is_collection=true, the json encoder is faster and more performant but
   * less resilient: it will fail when the content doesn’t have the expected type. If you are in control of the output of the service, choose json, if
   * you are not, choose safejson.
   */
  JSON = "json",
  /**
   * JSON with variable types
   */
  SAFEJSON = "safejson",
  /**
   * XML
   */
  XML = "xml",
  /**
   * RSS Feed (types Atom, RSS or JSON )
   */
  RSS = "rss",
  /**
   * Not an object, but a string
   */
  STRING = "string",

  /**
   * Nevermind, just proxy
   */
  NO_OP = "no-op",
}
