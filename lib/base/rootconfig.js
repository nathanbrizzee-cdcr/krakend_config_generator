"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootConfig = exports.RootConfigSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
const value_1 = require("@sinclair/typebox/value");
const fs = require("fs");
const path = require("path");
const RootConfigSchema = typebox_1.Type.Object({
    // $schema: Type.String({default:"https://www.krakend.io/schema/v3.json"}),
    $schema: typebox_1.Type.Literal("https://www.krakend.io/schema/v3.json"),
    //version: Type.Number({default:3}),
    version: typebox_1.Type.Literal(3),
    name: typebox_1.Type.String({ default: "Change Me" }),
    project: typebox_1.Type.String({ default: "Change Me" }),
    host: typebox_1.Type.Optional(typebox_1.Type.String({ default: "" })),
    port: typebox_1.Type.Literal(8080),
    cache_ttl: typebox_1.Type.String({ default: "0s" }),
    timeout: typebox_1.Type.String({ default: "2s" }),
    idle_timout: typebox_1.Type.String({ default: "0s" }),
    max_idle_connections: typebox_1.Type.Integer({ default: 0 }),
    output_encoding: typebox_1.Type.String({ default: "json" }),
    debug_endpoint: typebox_1.Type.Boolean({ default: false }),
    sequential_start: typebox_1.Type.Boolean({ default: false }),
    endpoints: typebox_1.Type.Array(typebox_1.Type.Object({})),
    async_agent: typebox_1.Type.Object({}),
    extra_config: typebox_1.Type.Object({}),
});
exports.RootConfigSchema = RootConfigSchema;
class RootConfig {
    /**
     *
     * @param description A description of this config file
     * @param projectName Becomes the output folder for the config file
     */
    constructor(description, projectName) {
        this.config = Object.assign({}, value_1.Value.Create(RootConfigSchema));
        this.config.name = description;
        this.config.project = projectName;
        this.config.debug_endpoint = process.env.DEBUG_ENDPOINT_ENABLED
            ? String(process.env.DEBUG_ENDPOINT_ENABLED) === "true"
            : false;
    }
    /** Returns the JSON config file */
    getConfig() {
        return this.config;
    }
    /** Writes the config file to disk */
    writeConfig() {
        const outFolder = path.join("configs", this.config.project);
        try {
            if (!fs.existsSync(outFolder)) {
                fs.mkdirSync(outFolder);
            }
            fs.writeFileSync(path.join(outFolder, "krakend.json"), JSON.stringify(this.config, null, 2));
        }
        catch (err) {
            console.error(err);
        }
    }
}
exports.RootConfig = RootConfig;
exports.default = RootConfig;
//# sourceMappingURL=rootconfig.js.map