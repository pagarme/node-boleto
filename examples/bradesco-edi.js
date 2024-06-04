const fs = require('fs')
const path = require('path')

const ediParser = require('../index').EdiParser

console.log(ediParser.parse('bradesco', fs.readFileSync(path.join(__dirname, 'retorno_bradesco.txt')).toString()))
