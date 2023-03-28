"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const rootconfig_1 = require("./base/rootconfig");
const rootConfig = new rootconfig_1.default("This is my favorite config", "pvdts");
rootConfig.config.async_agent = {
    foo: 1
};
console.log(rootConfig.config);
rootConfig.writeConfig();
//# sourceMappingURL=index.js.map