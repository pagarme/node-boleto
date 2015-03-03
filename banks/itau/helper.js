exports.dateFromEdiDate = function(ediDate) {
  return new Date(parseInt("20" + ediDate.substring(4, 8)), parseInt(ediDate.substring(2, 4)) - 1, parseInt(ediDate.substring(0, 2)));
}
