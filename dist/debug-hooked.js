"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cls = require("cls-hooked");
const debugFactory = require("debug");
/**
 * Creates a wrapper around a debug instance.
 * All calls to the wrapper logs the specified id that has the name <idName> before the other values passed
 *
 * @module debug-hooked
 */
function debugHookedFactory(nsName, idName) {
    return (namespace) => {
        const debug = debugFactory(namespace);
        const debugHooked = ((...args) => {
            const ns = cls.getNamespace(nsName);
            const id = ns.get(idName);
            const [first, ...rest] = args;
            debug(`[${id}] ${first}`, ...rest);
        });
        debugHooked.debug = debug;
        return debugHooked;
    };
}
exports.debugHookedFactory = debugHookedFactory;
//# sourceMappingURL=debug-hooked.js.map