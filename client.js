let net = require('net')
let JsonSocket = require('json-socket')
let argv = require('yargs').argv
let path = require('path')
let fs = require('fs')

let root_dir = argv.dir ? path.resolve(path.join(process.cwd(), argv.dir)) : path.resolve(process.cwd())

console.log(root_dir)
let socket = new JsonSocket(new net.Socket())

let payload = {action: 'write', 
  contents: 'Go Gators!',
  location: root_dir,
  fileName: 'sample.txt',
  type: 'directory',
  updated: new Date().getTime()
}

socket.connect(8001, `127.0.0.1`)

socket.on('connect', function() {
  socket.sendMessage(payload) 
  socket.on('message', function(serverMessage) {
    console.log(serverMessage)
  })
})

// let options = {
//   url: 'http://127.0.0.1:8000'
// }