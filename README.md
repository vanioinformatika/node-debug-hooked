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

```js
const express = require('express')
const uuidV4 = require('uuid/v4')

const cls = require("cls-hooked")
const { debugHookedFactory } = require('debug-hooked')

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
```

Copy the code above to a javascript file (sample.js) and start it with the following command:

```bash
DEBUG=sample* node sample.js
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

## Usage with some simple async code

This code sample uses async-await, but can be easily refactored.

```js
const uuidV4 = require('uuid/v4')

const cls = require("cls-hooked")
const { debugHookedFactory } = require('debug-hooked')

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
  // ns.run() is the important part as cls namespaces only work if the starting code is wrapped in an ns.run() call
  ns.run(async () => {
    cls.getNamespace(clsNamespaceName).set('asyncId', 'async_' + i)
    const res = await myAsyncFunction()
    debug('myAsyncFunction result:', res)
  })
})
```

Copy the code above to a javascript file (sample.js) and start it with the following command:

```bash
DEBUG=sample* node sample.js
```

You'll see something like this on the standard output:
```
sample:asyncawait [async_1] myOtherAsyncFunction running +0ms
sample:asyncawait [async_1] myOtherAsyncFunction +3ms
sample:asyncawait [async_2] myOtherAsyncFunction running +1ms
sample:asyncawait [async_2] myOtherAsyncFunction +0ms
sample:asyncawait [async_3] myOtherAsyncFunction running +0ms
sample:asyncawait [async_3] myOtherAsyncFunction +0ms
sample:asyncawait [async_1] myOtherAsyncFunction result: myOtherAsyncFunction result +801ms
sample:asyncawait [async_2] myOtherAsyncFunction result: myOtherAsyncFunction result +1ms
sample:asyncawait [async_3] myOtherAsyncFunction result: myOtherAsyncFunction result +1ms
sample:asyncawait [async_1] myAsyncFunction result: myAsyncFunction result +999ms
sample:asyncawait [async_2] myAsyncFunction result: myAsyncFunction result +1ms
sample:asyncawait [async_3] myAsyncFunction result: myAsyncFunction result +1ms
```

You can find the above Javascript code in the sample directory in async-await.js as well.
