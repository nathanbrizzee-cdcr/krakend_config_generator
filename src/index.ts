"use strict"
import "dotenv/config"
import { ServiceConfig } from "./templates/serviceconfig"

const pvdtsConfig = new ServiceConfig("This is my favorite config", "pvdts")
pvdtsConfig.logConfig()
pvdtsConfig.writeConfig()
