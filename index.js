let fs = require('fs')
let path = require('path')
let express = require('express')
let nodeify = require('bluebird-nodeify')
let morgan = require('morgan')

// songbird works during runtime. Hence, not assigning it to a variable
require('songbird')

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 8000;
// need a root directory for the file system api implementation
const ROOT_DIR = path.resolve(process.cwd());

// setting up the express app
let app = express()

// use() method is for adding the middleware 
 app.use(morgan('dev'))
if(NODE_ENV === 'development') {
 
}

app.listen(PORT, () => console.log(`Listening @ http://127.0.0.1:${PORT}`))

app.get('*', (req, res, next) => {
  
  
  async () => {
    // ROOT_DIR and __dirname are the same
    let filePath = path.resolve(path.join(ROOT_DIR, req.url))
    if(filePath.indexOf(ROOT_DIR) !== 0) {
      res.send(400, 'Invalid Path')
      return
    }
    // If the path is a directory, return the contents
    let stat = await fs.promise.stat(filePath)
    if(stat.isDirectory()) {
      let files = await fs.promise.readdir(filePath)
      res.json(files)
      return 
    }
    fs.createReadStream(filePath).pipe(res)
  }().catch(next) //next is called if this promise results in an error
  
  
})