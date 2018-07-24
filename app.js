const http = require('http')
const { createHook, executionAsyncId } = require('async_hooks')
const fs = require('fs')
let ctx = new Map()
let currentCtx

createHook({
  init(id, type, triggerId) {
    if (type !== 'PROMISE') return
    const val = ctx.get(triggerId)
    ctx.set(id, val)
  },
  before(id) {
    const parentCtx = ctx.get(id)
    if (parentCtx) currentCtx = parentCtx
  },
  after(id) {
    const parentCtx = ctx.get(id)
    if (parentCtx) currentCtx = parentCtx
  },
  destroy(id) {
    ctx.delete(id)
  },
}).enable();


function async () {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('ok')
    }, 2000)
  })
}

http.createServer(function (req, res) {
  if (req.url === '/favicon.ico') return

  const id = executionAsyncId()
  // TODO: set the ctx for the first time in a helper method?
  ctx.set(id, { val: id })
  currentCtx = { val: id }

  fs.writeSync(1, `---- ${currentCtx.val} started\n`)
  async().then(() => {
    fs.writeSync(1, `---- ${currentCtx.val} ended\n`)
    res.end('success')
  })
}).listen(3000)
