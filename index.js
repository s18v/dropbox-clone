let express = require('express')
let nodeify = require('bluebird-nodeify')
let morgan = require('morgan')

// songbird works during runtime. Hence, not assigning it to a variable
require('songbird')

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT || 8000;
// need a root directory for the file system api implementation
const ROOT_DIR = process.cwd();

// setting up the express app
let app = express()

if(NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
