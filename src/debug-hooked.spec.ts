import * as chai from "chai"
const { expect } = chai
import * as sinon from "sinon"
import * as sinonChai from "sinon-chai"
chai.use(sinonChai)

import * as cls from "cls-hooked"
import debug = require("debug")
import { debugHookedFactory } from "./debug-hooked"

describe("debugHooked", () => {

    const debugNs = "test"
    const debugText = "some debug text"
    const idName = "myId"
    const idValue = "myIdValue"
    const nsName = "myCtx"
    const ns = cls.createNamespace(nsName)
    const debugAny = debug as any
    debugAny.useColors = () => false
    debugAny.enable(debugNs)

    it("should return a debug wrapper that logs the specified id from the specified async context", () => {
        const debugHooked = debugHookedFactory(nsName, idName)
        expect(debugHookedFactory).to.be.a("Function")
        const debugLog = debugHooked(debugNs)
        const wrappedDebug = debugLog.debug
        ns.run(() => {
            const spy = sinon.spy()
            wrappedDebug.log = spy
            cls.getNamespace(nsName).set(idName, idValue)
            debugLog(debugText)
            // tslint:disable-next-line:no-unused-expression
            expect(wrappedDebug.log).to.have.been.calledOnce
            const callArgs = spy.getCall(0).args
            // tslint:disable-next-line:max-line-length
            const re = new RegExp(`\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z ${debugNs} \\[${idValue}\\] ${debugText}`)
            expect(callArgs[0]).to.match(re)
        })
    })
})
