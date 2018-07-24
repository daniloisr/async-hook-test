const http = require('http')
const { createHook, executionAsyncId } = require('async_hooks')
const fs = require('fs')
let ctx = new Map()
function globalCtx() { return ctx }
let currentCtx

let indent = 0
// createHook({
//   init(id, type, triggerId) {
//     if (type !== 'PROMISE') return
//     const val = ctx.get(triggerId)
//     ctx.set(id, val)
//   },
//   before(id) {
//     const parentCtx = ctx.get(id)
//     if (parentCtx) currentCtx = parentCtx
//   },
//   // after(id) {
//   //   const parentCtx = ctx.get(id)
//   //   if (parentCtx) currentCtx = parentCtx
//   // },
//   destroy(id) {
//     ctx.delete(id)
//   }
// }).enable()
createHook({
  init(asyncId, type, triggerAsyncId) {
    const eid = executionAsyncId();
    const indentStr = ' '.repeat(indent);
    fs.writeSync(
      1,
      `${indentStr}${type}(${asyncId}):` +
      ` trigger: ${triggerAsyncId} execution: ${eid}\n`);
    if (type !== 'PROMISE') return
    const val = ctx.get(triggerAsyncId)
    ctx.set(asyncId, val)
  },
  before(asyncId) {
    const indentStr = ' '.repeat(indent);
    fs.writeSync(1, `${indentStr}before:  ${asyncId}\n`);
    indent += 2;
    const parentCtx = ctx.get(asyncId)
    if (parentCtx) currentCtx = parentCtx
  },
  after(asyncId) {
    indent -= 2;
    const indentStr = ' '.repeat(indent);
    fs.writeSync(1, `${indentStr}after:   ${asyncId}\n`);
    const parentCtx = ctx.get(asyncId)
    if (parentCtx) currentCtx = parentCtx
  },
  destroy(asyncId) {
    const indentStr = ' '.repeat(indent);
    fs.writeSync(1, `${indentStr}destroy: ${asyncId}\n`);
    ctx.delete(asyncId)
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
  ctx.set(id, { val: id })
  currentCtx = { val: id }
  fs.writeSync(1, `---- ${currentCtx.val} started\n`)
  async().then(() => {
    fs.writeSync(1, `---- ${currentCtx.val} ended\n`)
    res.end('success')
  })
}).listen(3000)
