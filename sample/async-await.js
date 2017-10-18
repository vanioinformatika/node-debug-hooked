const uuidV4 = require('uuid/v4')

const cls = require("cls-hooked")
const { debugHookedFactory } = require('../dist/debug-hooked')

// request is the name of the CLS namespace that will hold the async context id
const clsNamespaceName = 'asyncCtx'
const ns = cls.createNamespace(clsNamespaceName)
// it wraps the debug package, you can use it the same way as the original debug package
const debugHooked = debugHookedFactory(clsNamespaceName, 'asyncId')
// create a new wrapped debug logger. this can be used the same way as the original debug
const debug = debugHooked('sample:asyncawait')

async function myAsyncFunction() {
  debug('myOtherAsyncFunction running')
  const res = await myOtherAsyncFunction()
  debug('myOtherAsyncFunction result:', res)
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('myAsyncFunction result'), 1000)
  })
}

async function myOtherAsyncFunction() {
  debug("myOtherAsyncFunction")
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('myOtherAsyncFunction result'), 800)
  })
}

[1, 2, 3].forEach(i => {
  ns.run(async () => {
    cls.getNamespace(clsNamespaceName).set('asyncId', 'async_' + i)
    const res = await myAsyncFunction()
    debug('myAsyncFunction result:', res)
  })
})
