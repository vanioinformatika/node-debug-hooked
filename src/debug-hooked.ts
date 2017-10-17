import * as cls from "cls-hooked"
import debugFactory = require("debug")

export interface DebugHooked {
    (...args: any[]): void,
    debug: debug.IDebugger
}

/**
 * Creates a wrapper around a debug instance.
 * All calls to the wrapper logs the specified id that has the name <idName> before the other values passed
 *
 * @module debug-hooked
 */
export function debugHookedFactory(nsName: string, idName: string) {
    return (namespace: string) => {
        const debug = debugFactory(namespace)
        const debugHooked = ((...args: any[]) => {
            const ns = cls.getNamespace(nsName)
            const id = ns.get(idName)
            const [first, ...rest] = args
            debug(`[${id}] ${first}`, ...rest)
        }) as DebugHooked
        debugHooked.debug = debug
        return debugHooked
    }
}
