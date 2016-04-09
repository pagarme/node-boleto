'use strict';

const crypto = require('crypto');

exports.calculateLineChecksum = (line) => {
	return crypto.createHash('sha1').update(line).digest('hex');
};