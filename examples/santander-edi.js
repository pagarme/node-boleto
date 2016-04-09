'use strict';

const fs = require('fs'),
	ediParser = require('../index').EdiParser;

console.log(ediParser.parse('santander', fs.readFileSync(__dirname + "/retorno.txt").toString()));