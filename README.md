[![Coverage Status](https://coveralls.io/repos/github/vanioinformatika/node-debug-hooked/badge.svg?branch=master)](https://coveralls.io/github/vanioinformatika/node-debug-hooked?branch=master)
[![Build Status](https://travis-ci.org/vanioinformatika/node-debug-hooked.svg?branch=master)](https://travis-ci.org/vanioinformatika/node-debug-hooked)

# node-debug-hooked
A wrapper around the [debug](http://npmjs.com/package/debug) package that prints out an arbitrary id (requestId, contextId)
from the asnyc context along with each line. It uses the [cls-hooked](http://npmjs.com/package/cls-hooked) package to follow
async contexts. CLS stands for continuation local storage and is very similar to Java's ThreadLocal. cls-hooked is the
implementation based on async-hooks introduced in Node.js 8.x.

Using this package, all your debug entries will be prefixed with a unique ID (e.g. HTTP request id) so you can follow the lifecycle of each incoming requests.

**NOTE:** right now, this package only works with Node.js 8.x+ as the compilation target is ES2017.


## Usage with Express.js

The following is a small example for Express.js but you can easily refactor to other frameworks like Koa.js.

### Javascript

```js
const express = require('express')
const uuidV4 = require('uuid/v4')

const cls = require("cls-hooked")
const { debugHookedFactory } = require('debug-hooked')

const clsNamespaceName = 'request' // request is the name of the CLS namespace that will hold the request id
const ns = cls.createNamespace(clsNamespaceName)
const debugHooked = debugHookedFactory(clsNamespaceName, 'requestId') // it wraps the debug package, you can use it the same way as the original debug package

// example express middleware that binds cls contexts to incoming requests
// based on the following example: https://clakech.github.io/cls-hooked-sample/
// ns.run() is the important part as cls namespaces only work if the starting code is wrapped in an ns.run() call
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

const debug = debugHooked('sample:hello')
app.get('/hello', (req, res) => {
  debug("before")
  res.status(200).send('hello world!')
  debug("after")
})

app.listen(3000, () => {
  console.log(`server started on port 3000`)
})
```

Copy the code above to a javascript file (sample.js) and start it with the following command:

```bash
DEBUG=sample node sample.js
```

Then call your server with the following:
```
curl http://localhost:3000/hello
```

You'll see something like this on the standard output of your server:
```
sample:hello [51f53654-647f-455a-8e45-91584aa31d1b] before +0ms
sample:hello [51f53654-647f-455a-8e45-91584aa31d1b] after +5ms
```

You can find the above Javascript code in the sample directory in express.js as well.
