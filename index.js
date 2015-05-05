let fs = require('fs')
let path = require('path')
let express = require('express')
let nodeify = require('bluebird-nodeify')
let morgan = require('morgan')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let argv = require('yargs').argv
let net = require('net')
let JsonSocket = require('json-socket')
// songbird works during runtime. Hence, not assigning it to a variable
require('songbird')

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 8000;
// need a root directory for the file system api implementation
const ROOT_DIR = argv.dir ? path.resolve(argv.dir) : path.resolve(process.cwd());

// setting up the express app
let app = express()

// use() method is for adding the middleware 
app.use(morgan('dev'))

// TCP Functionality
let TCP_PORT = '6789'
let TCP_HOST = '127.0.0.1'
let server = net.createServer()
server.on('connection', function (socket) {
  socket = new JsonSocket(socket);
})
server.listen(TCP_PORT)

app.listen(PORT,() => console.log(`Listening @ http://127.0.0.1:${PORT}`))

// HEADERS
app.head('*', setFileMeta, sendHeaders,(req, res) => res.end())

// GET
app.get('*', setFileMeta, sendHeaders,(req, res) => {
  if (res.body) {
    res.json(res.body)
    return
  }
  fs.createReadStream(req.filePath).pipe(res)
})

// DELETE
app.delete('*', setFileMeta,(req, res, next) => {
  async() => {
    if (!req.stat) return res.send(400, 'Invalid Path')

    if (req.stat.isDirectory()) {
      await rimraf.promise(req.filePath)
    } else await fs.promise.unlink(req.filePath)
    res.end()
  } ().catch(next)
})

// PUT
app.put('*', setFileMeta, setDirDetails,(req, res, next) => {
  async() => {
    if (req.stat) return res.send(405, 'File Exists')
    await mkdirp.promise(req.dirPath)
    if (!req.isDir) req.pipe(fs.createWriteStream(req.filePath))
    res.end()
  } ().catch(next)
})

// POST
app.post('*', setFileMeta, setDirDetails,(req, res, next) => {
  async() => {
    if (!req.stat) return res.send(405, 'File does not exist')
    if (req.isDir) return res.send(405, 'Path is a directory')

    await fs.promise.truncate(req.filePath, 0)
    if (!req.isDir) req.pipe(fs.createWriteStream(req.filePath))
    res.end()
  } ().catch(next)
})

function setDirDetails(req, res, next) {
  let filePath = req.filePath
  let endsWithSlash = filePath.charAt(filePath.length - 1) === path.sep
  let hasExt = path.extname(filePath) !== ''
  req.isDir = endsWithSlash || !hasExt
  req.dirPath = req.isDir ? filePath : path.dirname(filePath)
  next()
}

/* rather than splitting into separate functions, the 
calls are split into middlewares and then called*/
function setFileMeta(req, res, next) {
  // ROOT_DIR and __dirname are the same
  // resolve() resolves the path of any '.' characters
  req.filePath = path.resolve(path.join(ROOT_DIR, req.url))
  if (req.filePath.indexOf(ROOT_DIR) !== 0) {
    res.send(400, 'Invalid Path')
    return
  }
  // Way to call nodeify on a promise; check for async function too
  fs.promise.stat(req.filePath)
    .then(stat => req.stat = stat,() => req.stat = null)
    .nodeify(next)
}

function sendHeaders(req, res, next) {
  // promise is connected to the next callback (use of nodeify)
  // nodeify calls next even if it succeeds or fails
  nodeify(async() => {
    // If the path is a directory, return the contents
    if(req.stat.isDirectory()) {
      let files = await fs.promise.readdir(req.filePath)
      res.body = JSON.stringify(files)
      res.setHeader('Content-Length', res.body.length)
      res.setHeader('Content-Type', 'application/json')
      return
    }
    
    res.setHeader('Content-Length', req.stat.size)
    let contentType = mime.contentType(path.extname(req.filePath))
    res.setHeader('Content-Type', contentType)
  }(), next)
  //.catch(next) //next is called only if this promise results in an error
}
