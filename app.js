const http = require('http')
const { createHook, executionAsyncId } = require('async_hooks')
const fs = require('fs')
let ctx = new Map()

createHook({
  init(id, type, triggerId) {
    if (type === 'PROMISE' && ctx.has(triggerId))
      ctx.set(id, ctx.get(triggerId))
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
  currentCtx = { val: id }
  ctx.set(id, currentCtx)

  fs.writeSync(1, `---- ${currentCtx.val} started\n`)
  async().then(() => {
    currentCtx = ctx.get(executionAsyncId())
    fs.writeSync(1, `---- ${currentCtx.val} ended\n`)
    res.end('success')
  })
}).listen(3001)
