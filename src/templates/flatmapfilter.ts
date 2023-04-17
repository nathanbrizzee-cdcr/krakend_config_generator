import { Static, Type } from "@sinclair/typebox"

/**
 * The flatmap middleware allows you to manipulate collections (or arrays, or lists; you name it)
 * or to flatten objects from the response.
 *
 * While the basic manipulation operations allow you to work directly with objects, the collections
 * require you to use this flatmap component. The flatmap also will enable you to extract or move nested
 * objects to have a customized object structure.
 *
 * When working with lists, KrakenD needs to flatten and expand array structures to objects to operate
 * with them and vice versa. This process is automatically done by the flatmap component, letting you
 * concentrate only on the type of operation you want to execute.
 *
 * Prefer basic data manipulation operations such as mapping, target, deny or allow over flatmap whenever
 * you work with objects as their computational cost is lower. Reserve the flatmap component for
 * collections or operations that basic manipulation can’t do (such as flattening objects)
 *
 * @note
 * Flatmap at the endpoint level requires +1 backend
 *
 * The flatmap does not load at the endpoint level unless there is more than one backend configured,
 * as its purpose is to manipulate responses after the merge operation. Therefore, use it in the backend
 * if you only have one.
 *
 * @example
 * Extract objects to another level
 * Config:
 * {
 *   "backend": [{
 *     "url_pattern": "/shipping",
 *     "extra_config": {
 *       "proxy": {
 *         "flatmap_filter": [
 *           { "type": "move", "args": ["zone.state","shipping_state"] },
 *           { "type": "move", "args": ["zone.zip","shipping_zip"] },
 *           { "type": "del","args": ["zone"] }
 *         ]
 *       }
 *     }
 *   }]
 * }
 *
 * Input:
 * {
 *   "shipping_id": "f15f8c62-8c63-46de-a7f6-a08f131848c5",
 *   "zone": {
 *       "state": "NY",
 *       "zip": "10001"
 *   }
 * }
 *
 * Output:
 * {
 *   "shipping_id": "f15f8c62-8c63-46de-a7f6-a08f131848c5",
 *   "shipping_state": "NY",
 *   "shipping_zip": "10001"
 * }
 * @see https://www.krakend.io/docs/backends/flatmap/
 */
export const FlatmapFilterSchema = Type.Array(
  Type.Object({
    /**
     * The action type of operation to perform
     * move: To move, rename, embed or extract items from one place to another (equivalent concepts to and allow)
     * del: To delete specific items
     * append: To append items from one list to the other
     * @see https://www.krakend.io/docs/backends/flatmap/
     */
    type: Type.Union([
      Type.Literal("move"),
      Type.Literal("del"),
      Type.Literal("append"),
    ]),
    /**
     * A list of arguments to perform the action type on
     * @see https://www.krakend.io/docs/backends/flatmap/
     */
    args: Type.Array(Type.String(), { default: [] }),
  })
)
