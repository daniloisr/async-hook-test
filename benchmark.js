const { createHook, executionAsyncId } = require('async_hooks')

let ctx = new Map()
let currentCtx
let timmings = []

// createHook({
//   init(asyncId, type, triggerAsyncId) {
//     if (type !== 'PROMISE') return
//     const val = ctx.get(triggerAsyncId)
//     ctx.set(asyncId, val)
//   },
//   before(asyncId) {
//     const parentCtx = ctx.get(asyncId)
//     if (parentCtx) currentCtx = parentCtx
//   },
//   after(asyncId) {
//     const parentCtx = ctx.get(asyncId)
//     if (parentCtx) currentCtx = parentCtx
//   },
//   destroy(asyncId) {
//     ctx.delete(asyncId)
//   },
// }).enable();

async function testRequest(numberOfCallbacks) {
  // TODO: start stopwatch
  const now = Date.now()
  const id = executionAsyncId()

  ctx.set(id, now)
  currentCtx = now

  for(let i = 0; i < numberOfCallbacks; i++) {
    await timeout(1)
  }

  // TODO: stop stopwatch
  timmings.push(Date.now() - currentCtx)
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

testRequest(1000).then(() => {
  console.log(timmings)
})
