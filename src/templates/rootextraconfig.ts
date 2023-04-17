import { Static, Type } from "@sinclair/typebox"

enum LOGGINGTYPES {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

const RootExtraConfigSchema = Type.Object({
  router: Type.Object({
    /**
     * @see https://www.krakend.io/docs/backends/detailed-errors/
     */
    return_error_msg: Type.Boolean({ default: false }),
  }),
  "telemetry/logging": Type.Object({
    level: Type.Enum(LOGGINGTYPES, { default: "DEBUG" }),
    prefix: Type.String({ default: "[KRAKEND]" }),
    format: Type.Union([Type.Literal("default"), Type.Literal("logstash")], {
      default: "default",
    }),
    syslog: Type.Boolean({ default: false }),
    stdout: Type.Boolean({ default: true }),
  }),
  "telemetry/metrics": Type.Object({
    collection_time: Type.String({ default: "60s" }),
    proxy_disabled: Type.Boolean({ default: false }),
    router_disabled: Type.Boolean({ default: false }),
    backend_disabled: Type.Boolean({ default: false }),
    endpoint_disabled: Type.Boolean({ default: false }),
    listen_address: Type.Literal(8090),
  }),
  "security/http": Type.Object({
    frame_deny: Type.Boolean({ default: true }),
    referrer_policy: Type.String({ default: "same-origin" }),
    content_type_nosniff: Type.Boolean({ default: true }),
    browser_xss_filter: Type.Boolean({ default: true }),
    content_security_policy: Type.String({ default: "default-src 'self';" }),
  }),
  "security/cors": Type.Object({
    allow_origins: Type.Array(Type.String(), { default: ["*"] }),
    allow_methods: Type.Array(Type.String(), {
      default: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    }),
    allow_headers: Type.Array(Type.String(), {
      default: ["Origin", "Authorization", "Content-Type"],
    }),
    expose_headers: Type.Array(Type.String(), {
      default: ["Content-Length", "X-Response-Time"],
    }),
    max_age: Type.String({ default: "12h" }),
  }),
})

type RootExtraConfigType = Static<typeof RootExtraConfigSchema>

export { LOGGINGTYPES, RootExtraConfigSchema, RootExtraConfigType }
