'use strict';

exports.capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.addTrailingZeros = (string, length) => {
  string = string.toString();

  while (string.length < length) {
    string = "0" + string;
  }

  return string;
}

exports.formatAmount = (amount) => {
  amount = amount.toString();
  let cents = exports.addTrailingZeros(amount.substring(amount.length - 2, amount.length), 2);
  let integers = exports.addTrailingZeros(amount.substring(0, amount.length - 2), 1);

  let newIntegers = "";

  for (let i = 0; i < integers.length; i++) {
    if (i > 0 && (integers.length - i) % 3 == 0) newIntegers += ".";
    newIntegers += integers[i];
  }

  return "R$ " + newIntegers + "," + cents;
}

exports.formatDate = (date) => {
  return exports.addTrailingZeros(date.getDate(), 2) + "/" +
    exports.addTrailingZeros(date.getMonth() + 1, 2) + "/" + date.getFullYear();
}

exports.mod11 = (num, base, r) => {
  if (!base) base = 9;
  if (!r) r = 0;

  let soma = 0;
  let fator = 2;

  for (let i = num.length - 1; i >= 0; i--) {
    let parcial = parseInt(num[i]) * fator;
    soma += parcial;

    if (fator == base) {
      fator = 1;
    }

    fator++;
  }

  if (r == 0) {
    soma *= 10;
    let digito = soma % 11;
    return digito == 10 ? 0 : digito;
  } else if (r == 1) {
    return soma % 11;
  }
}

exports.mod10 = (num) => {
  let total = 0;
  let fator = 2;

  for (let i = num.length - 1; i >= 0; i--) {
    let temp = (parseInt(num[i]) * fator).toString();
    let tempSum = 0;
    for (let j = 0; j < temp.length; j++) {
      tempSum += parseInt(temp[j]);
    }
    total += tempSum;
    fator = (fator == 2) ? 1 : 2;
  }

  let resto = total % 10;
  return (resto == 0) ? 0 : (10 - resto);
}

exports.fatorVencimento = (date) => {
  return exports.addTrailingZeros(Math.floor((date.getTime() - new Date(1997, 9, 7).getTime()) / (24 * 3600 * 1000)), 4);
}

exports.dateFromEdiDate = (ediDate) => {
  return new Date(parseInt(ediDate.substring(4, 8)), parseInt(ediDate.substring(2, 4)) - 1, parseInt(ediDate.substring(0, 2)));
}

exports.removeTrailingZeros = (string) => {
  while (string.charAt(0) == '0') {
    string = string.substring(1, string.length);
  }

  return string;
}

exports.htmlString = (str) => {
  return str ? str.replace(/\n/g, '<br/>') : str;
}