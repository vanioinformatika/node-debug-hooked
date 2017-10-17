/// <reference types="debug" />
export interface DebugHooked {
    (...args: any[]): void;
    debug: debug.IDebugger;
}
/**
 * Creates a wrapper around a debug instance.
 * All calls to the wrapper logs the specified id that has the name <idName> before the other values passed
 *
 * @module debug-hooked
 */
export declare function debugHookedFactory(nsName: string, idName: string): (namespace: string) => DebugHooked;
