const crypto = require('crypto')

exports.calculateLineChecksum = function(line) {
  return crypto
    .createHash('sha1')
    .update(line)
    .digest('hex')
}
