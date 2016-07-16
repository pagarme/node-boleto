'use strict';

const fs = require('fs');

// Load banks
let banks = {},
	banksFolders = fs.readdirSync(__dirname + '/banks/');

for (let i = 0; i < banksFolders.length; i++) {
	banks[banksFolders[i]] = require(__dirname + '/banks/' + banksFolders[i] + '/index.js');
}

exports.Boleto = require('./lib/boleto')(banks);
exports.EdiParser = require('./lib/edi-parser')(banks);