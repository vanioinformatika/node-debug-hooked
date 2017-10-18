const express = require('express')
const uuidV4 = require('uuid/v4')

const cls = require("cls-hooked")
const { debugHookedFactory } = require('../dist/debug-hooked')

// request is the name of the CLS namespace that will hold the request id
const clsNamespaceName = 'request'
const ns = cls.createNamespace(clsNamespaceName)
// it wraps the debug package, you can use it the same way as the original debug package
const debugHooked = debugHookedFactory(clsNamespaceName, 'requestId')

// example express middleware that binds cls contexts to incoming requests
// based on the following example: https://clakech.github.io/cls-hooked-sample/
// ns.run() is the important part as cls namespaces only work if the starting code
// is wrapped in an ns.run() call
const clsBinder = (req, res, next) => {
  ns.bindEmitter(req)
  ns.bindEmitter(res)
  ns.run(() => {
    const requestId = req.headers['x-request-id'] || uuidV4()
    cls.getNamespace(clsNamespaceName).set('requestId', requestId)
    next()
  })
}

const app = express()
app.use(clsBinder)

// create a new wrapped debug logger. this can be used the same way as the original debug
const debug = debugHooked('sample:hello')

app.get('/hello', (req, res) => {
  debug("before")
  res.status(200).send('hello world!')
  debug("after")
})

app.listen(3000, () => {
  console.log(`server started on port 3000`)
})
