import { Static, Type } from "@sinclair/typebox"

/**
 * Circuit breaker for a backend service call
 * This is a must per service call to ensure the health of the system
 */
export const CircuitBreakerSchema = Type.Object({
  /**
   * Time window where the errors count, in seconds.
   * @see https://www.krakend.io/docs/backends/circuit-breaker/#interval
   */
  interval: Type.Integer({ default: 60 }),
  /**
   * For how many seconds the circuit breaker will wait before testing again if the backend is healthy.
   * @see https://www.krakend.io/docs/backends/circuit-breaker/#timeout
   */
  timeout: Type.Integer({ default: 10 }),
  /**
   * The consecutive number of errors within the interval window to consider the backend
   * unhealthy. An error is any response without a success (20x) status code or no response.
   * @see https://www.krakend.io/docs/backends/circuit-breaker/#max_errors
   */
  max_errors: Type.Integer({ default: 1 }),
  /**
   * A friendly name to follow this circuit breaker’s activity in the logs.
   * @see https://www.krakend.io/docs/backends/circuit-breaker/#name
   */
  name: Type.String({ default: "circuit breaker" }),
  /**
   * Whether to log the changes of state of this circuit breaker or not.
   * @see https://www.krakend.io/docs/backends/circuit-breaker/#log_status_change
   */
  log_status_change: Type.Boolean({ default: true }),
})
