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
  const cents = exports.addTrailingZeros(amount.substring(amount.length - 2, amount.length), 2)
  const integers = exports.addTrailingZeros(amount.substring(0, amount.length - 2), 1)

  let newIntegers = ''

  for (let i = 0; i < integers.length; i++) {
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

  let soma = 0
  let fator = 2

  for (let i = num.length - 1; i >= 0; i--) {
    const parcial = parseInt(num[i]) * fator
    soma += parcial

    if (fator == base) {
      fator = 1
    }

    fator++
  }

  if (r == 0) {
    soma *= 10
    const digito = soma % 11
    return digito == 10 ? 0 : digito
  } else if (r == 1) {
    return soma % 11
  }
}

exports.mod10 = function (num) {
  let total = 0
  let fator = 2

  for (let i = num.length - 1; i >= 0; i--) {
    const temp = (parseInt(num[i]) * fator).toString()
    let tempSum = 0
    for (let j = 0; j < temp.length; j++) {
      tempSum += parseInt(temp[j])
    }
    total += tempSum
    fator = (fator == 2) ? 1 : 2
  }

  const resto = total % 10
  return (resto == 0) ? 0 : (10 - resto)
}

exports.fatorVencimento = function (date) {
  const parsedDate = moment(date).utc().format('YYYY-MM-DD')
  const startDate = moment('1997-10-07').utc().format('YYYY-MM-DD')
  return exports.addTrailingZeros(moment(parsedDate).diff(startDate, 'days'), 4)
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
