"use strict"
import "dotenv/config"
import { ServiceConfig } from "./templates/serviceconfig"
import { Endpoint, METHODS } from "./templates/endpoint"

const pvdtsConfig = new ServiceConfig(
  "This is my favorite config",
  "pvdts",
  "1.0.0"
)
pvdtsConfig.addEndpoint(
  new Endpoint("/v1/cars", METHODS.GET, "This endpoint reads a list of cars")
)

pvdtsConfig.logConfig()
pvdtsConfig.writeConfig()
//=================================================
//testing below
//=================================================
const test = {
  endpoints: [
    {
      description: "This endpoint gets a single user summary",
      endpoint: "/v1/users/{user}",
      method: "GET",
      timeout: "3s",
      auth: {
        scopes: ["user.read"],
      },
      backend: [
        {
          url_pattern: "/users/summary/{user}",
          method: "GET",
          timeout: "2s",
          host: "http://PVDTS-COMMON",
        },
      ],
    },
    {
      description: "This endpoint gets all user summaries",
      endpoint: "/v1/users",
      method: "GET",
      timeout: "5s",
      input_query_strings: ["items", "page"],
      auth: {
        scopes: ["user.read"],
      },
      backend: [
        {
          url_pattern: "/users/summary",
          method: "GET",
          timeout: "4s",
          host: "http://PVDTS-COMMON",
        },
      ],
    },
  ],
}

const registration_json = {
  defaultRoles: ["Standard User"],
  hiddenRoles: ["core"],
  defaultAdmins: ["System Administrator"],
  roles: {
    core: {
      description: "Not assigned to user",
      priority: 1000,
      scopes: ["user.read"],
      permissions: {
        auth: {
          v1: {
            authentication: "fgr",
            userprefs: "fgcupr",
          },
        },
      },
    },
    "Standard User": {
      description: "User roles determined by PVDTS database",
      priority: 500,
      inherit: ["core"],
      scopes: ["user.write"],
      permissions: {
        leads: {
          v1: {
            offenderphotos: "fg",
          },
        },
        "pvdts-common": {
          v1: {
            referencedata: "fg",
            parolee: "fgcupr",
            fs_upload_file: "c",
            fs_upload_req: "c",
            fs_upload_status: "f",
            fs_download_file: "c",
            fs_download_req: "c",
            doc: "fc",
            appconfig: "fg",
            helptickets: "fg",
            usergroups: "g",
            groupfeatures: "g",
            userfeatures: "f",
            offenderphotos: "f",
          },
        },
        "pvdts-violation": {
          v1: {
            cases: "fguc",
          },
        },
        "pvdts-treatment": {
          v1: {
            cases: "fgc",
            programs: "f",
            providers: "f",
          },
        },
        "pvdts-discharge": {
          v1: {
            drform1502: "fgcu",
          },
        },
        eis: {
          common: {
            v1: {
              offender_photo: "fg",
              offender_primary_photo: "fg",
            },
          },
        },
      },
    },
    "System Administrator": {
      description: "Gives access to manage users in the application",
      priority: 0,
      inherit: ["Standard User"],
      permissions: {
        auth: {
          v1: {
            usersbyapp: "fgcup",
            appuserroles: "fgcup",
            accountsbyapp: "fgcup",
            local_account: "cp",
          },
        },
        "pvdts-common": {
          v1: {
            doc: "r",
            appconfig: "cupr",
            helptickets: "cupr",
            usergroups: "fgcup",
            groupfeatures: "fgcup",
          },
        },
      },
    },
  },
}
console.log(test)
