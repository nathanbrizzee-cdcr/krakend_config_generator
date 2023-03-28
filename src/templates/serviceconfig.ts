import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import * as fs from "fs"
import * as path from "path"

import { RootExtraConfigSchema } from "./extraconfig"

const ServiceConfigSchema = Type.Object({
  // $schema: Type.String({default:"https://www.krakend.io/schema/v3.json"}),
  $schema: Type.Literal("https://www.krakend.io/schema/v3.json"),
  //version: Type.Number({default:3}),
  version: Type.Literal(3),
  name: Type.String({ default: "Change Me" }),
  project: Type.String({ default: "Change Me" }),
  host: Type.Optional(Type.String({ default: "" })),
  port: Type.Literal(8080),
  cache_ttl: Type.String({ default: "0s" }),
  timeout: Type.String({ default: "2s" }),
  idle_timout: Type.String({ default: "0s" }),
  max_idle_connections: Type.Integer({ default: 0 }),
  output_encoding: Type.String({ default: "json" }),
  debug_endpoint: Type.Boolean({ default: false }),
  sequential_start: Type.Boolean({ default: false }),
  endpoints: Type.Array(Type.Object({})),
  async_agent: Type.Object({}),
  extra_config: RootExtraConfigSchema,
})
type ServiceConfigType = Static<typeof ServiceConfigSchema>

class ServiceConfig {
  public config: ServiceConfigType

  /**
   *
   * @param description A description of this config file
   * @param projectName Becomes the output folder for the config file
   */
  constructor(description: string, projectName: string) {
    this.config = Value.Create(ServiceConfigSchema)
    this.config.name = description
    this.config.project = projectName
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
export default ServiceConfig
