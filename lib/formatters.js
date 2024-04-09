const escapeXML = require('ejs').escapeXML
const moment = require('moment')

exports.capitalize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

exports.addTrailingZeros = function (string, length) {
  string = string.toString()

  while (string.length < length) {
    string = '0' + string
  }

  return string
}

exports.formatAmount = function (amount) {
  amount = amount.toString()
  var cents = exports.addTrailingZeros(amount.substring(amount.length - 2, amount.length), 2)
  var integers = exports.addTrailingZeros(amount.substring(0, amount.length - 2), 1)

  var newIntegers = ''

  for (var i = 0; i < integers.length; i++) {
    if (i > 0 && (integers.length - i) % 3 == 0) newIntegers += '.'
    newIntegers += integers[i]
  }

  return 'R$ ' + newIntegers + ',' + cents
}

exports.formatDate = function (date) {
  return moment(date).format('DD/MM/YYYY')
}

exports.mod11 = function (num, base, r) {
  if (!base) base = 9
  if (!r) r = 0

  var soma = 0
  var fator = 2

  for (var i = num.length - 1; i >= 0; i--) {
    var parcial = parseInt(num[i]) * fator
    soma += parcial

    if (fator == base) {
      fator = 1
    }

    fator++
  }

  if (r == 0) {
    soma *= 10
    var digito = soma % 11
    return digito == 10 ? 0 : digito
  } else if (r == 1) {
    return soma % 11
  }
}

exports.mod10 = function (num) {
  var total = 0
  var fator = 2

  for (var i = num.length - 1; i >= 0; i--) {
    var temp = (parseInt(num[i]) * fator).toString()
    var tempSum = 0
    for (var j = 0; j < temp.length; j++) {
      tempSum += parseInt(temp[j])
    }
    total += tempSum
    fator = (fator == 2) ? 1 : 2
  }

  var resto = total % 10
  return (resto == 0) ? 0 : (10 - resto)
}

exports.fatorVencimento = function (date) {
  const parsedDate = moment(date).utc().format('YYYY-MM-DD')
  const startDate = moment('1997-10-07').utc().format('YYYY-MM-DD')

  let factor = moment(parsedDate).diff(startDate, 'days')

  if (factor >= 10000) {
    factor = (factor % 10000) + 1000
  }

  return exports.addTrailingZeros(factor, 4)
}

exports.dateFromEdiDate = function (ediDate) {
  return new Date(parseInt(ediDate.substring(4, 8)), parseInt(ediDate.substring(2, 4)) - 1, parseInt(ediDate.substring(0, 2)))
}

exports.removeTrailingZeros = function (string) {
  while (string.charAt(0) == '0') {
    string = string.substring(1, string.length)
  }

  return string
}

exports.htmlString = function (str) {
  return str ? escapeXML(str).replace(/\n/g, '<br/>') : str
}
