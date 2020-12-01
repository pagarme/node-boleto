var crypto = require('crypto')

exports.calculateLineChecksum = function (line) {
  return crypto.createHash('sha1').update(line).digest('hex')
}

exports.dateFromEdiDate = function (ediDate) {
  const year = ediDate.substring(4, 8)
  const month = ediDate.substring(2, 4)
  const day = ediDate.substring(0, 2)

  return new Date(parseInt('20' + year), parseInt(month) - 1, parseInt(day))
}
