const http = require('http')
let id

function async () {
  return new Promise((resolve) => {
    console.log(id, 'started')
    setTimeout(() => {
      console.log(id, 'ended')
      resolve('ok')
    }, 4000);
  })
}

http.createServer(function (req, res) {
  id = Math.floor(Math.random() * 1e4)
  async().then(() => {
    res.end('success')
  })
}).listen(3000)
