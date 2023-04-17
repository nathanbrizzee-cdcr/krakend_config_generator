import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import * as fs from "fs"
import * as path from "path"

import { RootExtraConfigSchema } from "./rootextraconfig"
import { Endpoint, METHODS } from "./endpoint"

const ServiceConfigSchema = Type.Object({
  $schema: Type.Literal("https://www.krakend.io/schema/v3.json"),
  /** krakend version number.  Don't change unless the spec changes */
  version: Type.Literal(3),
  /** What version this api is for us */
  my_version: Type.String({ default: "0.0.1" }),
  name: Type.String({ default: "Change Me" }),
  project: Type.String({ default: "Change Me" }),
  /**Host is used only when every api goes to the same backend host. */
  host: Type.Optional(Type.String({ default: "" })),
  port: Type.Literal(8080),
  cache_ttl: Type.String({ default: "0s" }),
  timeout: Type.String({ default: "2s" }),
  idle_timout: Type.String({ default: "0s" }),
  max_idle_connections: Type.Integer({ default: 0 }),
  output_encoding: Type.String({ default: "json" }),
  debug_endpoint: Type.Boolean({ default: false }),
  sequential_start: Type.Boolean({ default: false }),
  /**https://www.krakend.io/docs/backends/#disable-restful-checking */
  disable_rest: Type.Boolean({ default: false }),
  endpoints: Type.Array(Type.Object({})),
  async_agent: Type.Object({}),
  extra_config: RootExtraConfigSchema,
})
type ServiceConfigType = Static<typeof ServiceConfigSchema>

export default class ServiceConfig {
  public config: ServiceConfigType
  /**
   *
   * @param description A description of this config file
   * @param projectName Becomes the output folder for the config file
   * @param version A version number for us to track this with
   */
  constructor(description: string, projectName: string, version: string) {
    this.config = Value.Create(ServiceConfigSchema)
    this.config.name = description
    this.config.project = projectName
    this.config.my_version = version
    // this.config.debug_endpoint = process.env.DEBUG_ENDPOINT_ENABLED
    //   ? String(process.env.DEBUG_ENDPOINT_ENABLED) === "true"
    //   : false
    this.config.extra_config = Value.Create(RootExtraConfigSchema)
    // // @ts-expect-error
    // this.config.extra_config["telemetry/logging"].level = process.env
    //   .TELEMETRY_LOGGING_LEVEL
    //   ? String(process.env.TELEMETRY_LOGGING_LEVEL)
    //   : "DEBUG"
  }

  /** Adds and endpoint to the service config */
  public addEndpoint(endpoint: Endpoint): void {
    this.config.endpoints.push(endpoint.getConfig())
  }

  /** Returns the JSON config file */
  public getConfig(): ServiceConfigType {
    return this.config
  }

  /** Writes the config file to disk */
  public writeConfig(): void {
    const outFolder = path.join("configs", this.config.project)

    try {
      if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder)
      }
      fs.writeFileSync(
        path.join(outFolder, "krakend.json"),
        JSON.stringify(this.config, null, 2)
      )
    } catch (err) {
      console.error(err)
    }
  }
  public logConfig(): void {
    console.log(JSON.stringify(this.config, null, 2))
  }
}

export { ServiceConfigSchema, ServiceConfigType, ServiceConfig }
