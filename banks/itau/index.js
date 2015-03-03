var formatters = require('../../lib/formatters'),
  ediHelper = require('../../lib/edi-helper'),
  helper = require('./helper');

exports.options = {
  logoURL: 'http://borboleto.com.br/boletos/itau/imagens/logo_itau.gif',
  codigo: '341'
};

exports.dvBarra = function (barra) {
  var resto2 = formatters.mod11(barra, 9, 1);
  return (resto2 == 0 || resto2 == 1 || resto2 == 10 || resto2 == 11) ? 1 : 11 - resto2;
};

exports.barcodeData = function (boleto) {
  var codigoBanco = this.options.codigo;
  var numMoeda = "9";

  var fatorVencimento = formatters.fatorVencimento(boleto['data_vencimento']);

  var agencia = formatters.addTrailingZeros(boleto['agencia'], 4);

  var conta = formatters.addTrailingZeros(boleto['codigo_cedente'], 5);

  var valor = formatters.addTrailingZeros(boleto['valor'], 10);
  var carteira = boleto['carteira'];

  var nossoNumero = formatters.addTrailingZeros(boleto['nosso_numero'], 8);

  var barra = codigoBanco + numMoeda + fatorVencimento + valor + carteira + nossoNumero + formatters.mod10(agencia + conta + carteira + nossoNumero) + agencia + conta + formatters.mod10(agencia + conta) + '000';

  var dvBarra = this.dvBarra(barra);
  var lineData = barra.substring(0, 4) + dvBarra + barra.substring(4, barra.length);

  boleto['codigo_cedente'] = [conta, '-', formatters.mod10([agencia, conta].join(''))].join('');
  boleto['nosso_numero'] = carteira + '/' + nossoNumero;
  boleto['nosso_numero_dv'] = formatters.mod10([agencia, conta, carteira, nossoNumero].join(''));

  return lineData;
};

exports.linhaDigitavel = function (barcodeData) {
  // 01-03    -> Código do banco sem o digito
  // 04-04    -> Código da Moeda (9-Real)
  // 05-05    -> Dígito verificador do código de barras
  // 06-09    -> Fator de vencimento
  // 10-19    -> Valor Nominal do Título
  // 20-44    -> Campo Livre (Abaixo)
  // 20-24    -> Código da Agencia (sem dígito)
  // 25-27    -> Número da Carteira
  // 28-36    -> Nosso Número (sem dígito)
  // 37-43    -> Conta do Cedente (sem dígito)
  // 44-44    -> Zero (Fixo)

  var campos = [];

  // 1. Campo - composto pelo código do banco, código da moéda, as cinco primeiras posições
  // do campo livre e DV (modulo10) deste campo
  var campo = barcodeData.substr(0, 3) + barcodeData.substr(3, 1) + barcodeData.substr(19, 3) + barcodeData.substr(22, 2);
  campo = campo + formatters.mod10(campo);
  campo = campo.substr(0, 5) + '.' + campo.substr(5);
  campos.push(campo);

  // 2. Campo - composto pelas posiçoes 6 a 15 do campo livre
  // e livre e DV (modulo10) deste campo
  campo = barcodeData.substr(24, 6) + barcodeData.substr(30, 1) + barcodeData.substr(31, 3);
  campo = campo + formatters.mod10(campo);
  campo = campo.substr(0, 5) + '.' + campo.substr(5);
  campos.push(campo);

  // 3. Campo composto pelas posicoes 16 a 25 do campo livre
  // e livre e DV (modulo10) deste campo
  campo = barcodeData.substr(34, 1) + barcodeData.substr(35, 6) + barcodeData.substr(41, 3);
  campo = campo + formatters.mod10(campo);
  campo = campo.substr(0, 5) + '.' + campo.substr(5);
  campos.push(campo);

  // 4. Campo - digito verificador do codigo de barras
  campo = barcodeData.substr(4, 1);
  campos.push(campo);

  // 5. Campo composto pelo fator vencimento e valor nominal do documento, sem
  // indicacao de zeros a esquerda e sem edicao (sem ponto e virgula). Quando se
  // tratar de valor zerado, a representacao deve ser 000 (tres zeros).
  campo = barcodeData.substr(5, 4) + barcodeData.substr(9, 10);
  campos.push(campo);

  return campos.join(" ");
};

exports.parseEDIFile = function (fileContent) {
  console.log('Not implemented');
};
