'use strict';

const fs = require('fs'),
	ediParser = require('../index').EdiParser;

console.log(ediParser.parse('bradesco', fs.readFileSync(__dirname + "/retorno_bradesco.txt").toString()));