import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"

import { BACKEND_ENCODINGS } from "./encodings"
import { METHODS } from "./methods"
import { FlatmapFilterSchema } from "./flatmapfilter"
import { RateLimitSchema } from "./ratelimit"
import { CircuitBreakerSchema } from "./circuitbreaker"

const BackendSchema = Type.Object({
  /**
   * Detailed description of this api end point and what it does.
   */
  "@comment": Type.String({
    default: "Enter some detail about this backend api endpoint",
  }),
  /**
   * An array with all the available hosts to load balance requests, including the schema (when possible)
   * schema://host:port. E.g.: https://my.users-ms.com. If you are in a platform where hosts or services are balanced
   * (e.g., a K8S service), write a single entry in the array with the service name/balancer address. Defaults to the host
   * declaration at the configuration’s root level, and the service fails starting when there is none.
   * @see https://www.krakend.io/docs/backends/#host
   */
  host: Type.Array(Type.String({ default: "http://missing.server.name" })),
  /**
   * The path inside the service (no protocol, no host, no method). E.g: /users. Some functionalities under
   * extra_config might drop the requirement of declaring a valid url_pattern, but they are exceptions. The URL must
   * be RESTful, if it is not (e.g.: /url.{some_variable}.json), then see how to disable RESTful checking.
   * @see https://www.krakend.io/docs/backends/#url_pattern
   */
  url_pattern: Type.String({ default: "/v1/someapi" }),
  /**
   * The method sent to this backend in uppercase. The method does not need to match the endpoint’s method. When
   * the value is omitted, it uses the same endpoint’s method
   */
  method: Type.Enum(METHODS, { default: "GET" }),
  /**
   * Defines your needed encoding to set how to parse the response. Defaults to the value of its endpoint’s encoding,
   * or to json if not defined anywhere else.
   */
  encoding: Type.Enum(BACKEND_ENCODINGS, { default: "json" }),
  /**
   * Only return the fields in the list. Only the matching fields (case-sensitive) are returned in the final response. Use a
   * dot . separator to define nested attributes, e.g.: a.b removes {"a":{"b": true}}.
   * @note The preferred method is to use allow over deny.  This is the most secure because it whitelists the only valid fields
   * @see https://www.krakend.io/docs/backends/data-manipulation/
   */
  allow: Type.Array(Type.String(), { default: [] }),
  /**
   * Don’t return the fields in the list. All matching fields (case-sensitive) defined in the list, are removed from the
   * response. Use a dot . separator to definr nested attributes, e.g.: a.b removes {"a":{"b": true}}.
   * @note The preferred method is allow, when possible.  Sometimes it's not possible to use a whitelist - for instance,
   * when the front end writes variable data in a payload.  In that case, you can use deny to remove fields you do not want in the payload
   * @see https://www.krakend.io/docs/backends/data-manipulation/
   */
  deny: Type.Array(Type.String(), { default: [] }),
  /**
   * Set it to true when the host doesn’t need to be checked for an HTTP protocol. This is the case of sd=dns or when
   * using other protocols like amqp://, nats://, kafka://, etc. When set to true, and the protocol is not HTTP,
   * KrakenD fails with an invalid host error.
   * @see https://www.krakend.io/docs/backends/#disable_host_sanitize
   */
  disable_host_sanitize: Type.Boolean({ default: false }),
  /**
   * Instead of placing all the response attributes in the root of the response, create a new key and encapsulate the
   * response inside.
   */
  group: Type.String({ default: "backend1" }),
  /**
   * Set to true when your API does not return an object {} but a collection []
   */
  is_collection: Type.Boolean({ default: false }),
  /**
   * Mapping, or also known as renaming, let you change the name of the fields of the generated responses, so your
   * composed response would be as close to your use case as possible without changing a line on any backend.
   */
  mapping: Type.Object({}),
  /**
   * The Service Discovery system to resolve your backend services. Defaults to static (no external Service
   * Discovery). Use dns to use DNS SRV records.
   *
   * The static resolution is the default service discovery strategy. It implies that you write directly in the configuration the
   *  protocol plus the service name, hosts or IPs you want to connect to.
   *
   * The static resolution uses a list of hosts to load balance (in a Round Robin fashion) all servers in the list, and you should
   * expect more or less an equivalent number of hits on each backend. However, if you use a Kubernetes service, then it load-
   * balances itself so that you only need one entry.
   *
   * The DNS SRV(see RFC) is a market standard used by systems such as Kubernetes, Mesos, Haproxy, Nginx plus, AWS ECS,
   * Linkerd, and many more. An SRV entry is a custom DNS record that establishes connections between services. When
   * KrakenD needs to know the location of a specific service, it will search for a related SRV record.
   *
   * With sd set to dns, KrakenD will query every 30 seconds the host name DNS record and will apply to
   * the internal balancer any weights and priorities returned by the DNS record.
   *
   * @see https://www.krakend.io/docs/backends/service-discovery/
   */
  sd: Type.Union([Type.Literal("static"), Type.Literal("dns")], {
    default: "static",
  }),
  /**
   * Removes the matching object from the reponse and returns only its contents.
   */
  target: Type.String({ default: "" }),
  /**
   * When there is additional configuration related to a specific component or middleware (like a circuit breaker, rate
   * limit, etc.), it is declared under this section.
   * @see https://www.krakend.io/docs/backends/#extra_config
   */
  extra_config: Type.Object({
    /**
     * @see https://www.krakend.io/docs/backends/flatmap/
     */
    proxy: Type.Optional(
      Type.Object({
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
         * There are times when you have been working in a new version of your microservice, a complete refactor,
         * a dangerous change, or any other valuable change that needs being careful, and it’s too risky to put it
         * live as there might be issues that impact your end users.
         *
         * The traffic shadowing or traffic mirroring functionality allows you to test new backends in production
         * by sending them copies of the traffic but ignore their responses.
         *
         * When you add a backend to any of your endpoints as a shadow backend, KrakenD continues to send the requests
         * to all the backends as usual, but the responses from the ones marked as shadow are ignored and never returned
         * or merged in the response.
         *
         * Mirroring the traffic to your microservices allows you to test your new backend from the interesting perspective
         * of seeing behavior in production. For instance, you could:
         * - Test the application errors by examining its logs
         * - Test the performance of the application
         * - Stress a new server
         * - Retrieve any other interesting data that you can only see when you have something running in production.
         *
         * @see https://www.krakend.io/docs/backends/shadow-backends/
         */
        shadow: Type.Optional(Type.Boolean()),
      })
    ),
    /**
     * Sets rate limiting for backend api calls
     * @see https://www.krakend.io/docs/backends/rate-limit/
     */
    "qos/ratelimit/proxy": Type.Object({ RateLimitSchema }),
    /**
     * @see https://www.krakend.io/docs/backends/circuit-breaker/
     */
    "qos/circuit-breaker": Type.Object({ CircuitBreakerSchema }),
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
     * Caching allows you to store backend responses in memory to reduce the number of calls a user sends to
     * the origin, reducing the network traffic and alleviating your services’ pressure.
     *
     * Caching increases memory consumption
     *
     * Caching can significantly increase the load and memory consumption as the returned data is saved
     * in memory until its expiration period. The size of the cache depends 100% on your backends. You will
     * need to dimension your instance accordingly, and monitor its consumption!
     *
     * @see https://www.krakend.io/docs/backends/caching/
     */
    "qos/http-cache": Type.Optional(Type.Object({})),
    /**
     * The krakend-martian component allows you to transform requests and responses through a simple DSL
     * definition in the configuration file. Martian works perfectly in combination with CEL verifications.
     *
     * Use Martian when you want to intercept the end-user’s request and make modifications before passing
     * the content to the backends. Also, the other way around, transform the backends response before passing
     * it to the user.
     *
     * Martian is mighty and gives you endless possibilities to control what is going in and out of the gateway.
     * Some examples of typical Martian scenarios are:
     * - Set a new cookie during gateway processing
     * - Add, remove or change specific headers
     * - Query string additions before making the backend request (e.g., set an API key)
     *
     * There are four different types of interactions you can do with Martian:
     * - Modifiers: Change the state of a request or a response. For instance, you want to add a custom
     * header in the request before sending it to a backend.
     * - Filters: Add a condition to execute a contained Modifier
     * - Groups: Bundle multiple operations to execute in the order specified in the group
     * - Verifiers: Track network traffic against expectations
     * @see https://www.krakend.io/docs/backends/martian/
     */
    "modifier/martian": Type.Optional(Type.Object({})),
    /**
     * You can connect an endpoint to multiple publish/subscribe backends, helping you integrate with event driven architectures.
     *
     * For instance, a frontend client can push events to a queue using a REST interface. Or a client could consume
     * a REST endpoint that is plugged to the last events pushed in a backend. You can even validate messages and formats
     * as all the KrakenD available middleware can be used. The list of supported backend technologies is:
     * - AWS SNS (Simple Notification Service) and SQS (Simple Queueing Service)
     * - Azure Service Bus Topic and Subscription
     * - GCP PubSub
     * - NATS.io
     * - RabbitMQ
     * - Apache Kafka
     *
     * The host key defines the desired driver, and the actual host is usually set in an environment variable outside of KrakenD
     *
     * @see https://www.krakend.io/docs/backends/pubsub/
     */
    "backend/pubsub/subscriber": Type.Optional(
      Type.Object({
        /**
         * Subscription URL according to the selected driver
         * @see https://www.krakend.io/docs/backends/pubsub/#subscription_url
         */
        subscription_url: Type.String(),
      })
    ),
    /**
     * You can connect an endpoint to multiple publish/subscribe backends, helping you integrate with event driven architectures.
     *
     * For instance, a frontend client can push events to a queue using a REST interface. Or a client could consume
     * a REST endpoint that is plugged to the last events pushed in a backend. You can even validate messages and formats
     * as all the KrakenD available middleware can be used. The list of supported backend technologies is:
     * - AWS SNS (Simple Notification Service) and SQS (Simple Queueing Service)
     * - Azure Service Bus Topic and Subscription
     * - GCP PubSub
     * - NATS.io
     * - RabbitMQ
     * - Apache Kafka
     *
     * The host key defines the desired driver, and the actual host is usually set in an environment variable outside of KrakenD
     *
     * @see https://www.krakend.io/docs/backends/pubsub/
     */
    "backend/pubsub/publisher": Type.Optional(
      Type.Object({
        /**
         * Topic URL according to the selected driver
         * @see https://www.krakend.io/docs/backends/pubsub/#topic_url
         */
        topic_url: Type.String(),
      })
    ),
    /**
     *
     * @see https://www.krakend.io/docs/backends/detailed-errors/
     */
    "backend/http": Type.Optional(
      Type.Object({
        /**
         * The return_error_details option sets an alias for this backend. When a backend fails, you’ll find an object
         * named error_ + its backend_alias containing the detailed errors of the backend. If there are no errors, the key won’t exist.
         *
         * @example
         * Config:
         * {
         *   "url_pattern": "/return-my-errors",
         *   "extra_config": {
         *     "backend/http": {
         *       "return_error_details": "api_foo_backend_alias"
         *      }
         *   }
         * }
         *
         * API return:
         * {
         *   "error_api_foo_backend_alias": {
         *     "http_status_code": 404,
         *     "http_body": "404 page not found\\n"
         *   }
         * }
         * @see https://www.krakend.io/docs/backends/detailed-errors/
         */
        return_error_details: Type.Optional(Type.String()),
        /**
         * Forward the HTTP status code of a single backend
         * Notice that the return_error_code and the return_error_details are mutually exclusive.
         * You can use one or the other but not both. If you declare them together, the gateway will use only return_error_details.
         * @see https://www.krakend.io/docs/backends/detailed-errors/
         */
        return_error_code: Type.Optional(Type.Boolean()),
      })
    ),
  }),
})
CircuitBreakerSchema
