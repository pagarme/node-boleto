'use strict';

const formatters = require('../../lib/formatters'),
  ediHelper = require('../../lib/edi-helper'),
  helper = require('./helper');

exports.options = {
  logoURL: 'https://assets.pagar.me/boleto/images/santander.png',
  codigo: '033'
}

exports.dvBarra = (barra) => {
  let resto2 = formatters.mod11(barra, 9, 1);
  return (resto2 == 0 || resto2 == 1 || resto2 == 10) ? 1 : 11 - resto2;
}

exports.barcodeData = (boleto) => {
  let codigoBanco = this.options.codigo;
  let numMoeda = "9";
  let fixo = "9"; // Numero fixo para a posição 05-05
  let ios = "0"; // IOS - somente para Seguradoras (Se 7% informar 7, limitado 9%) - demais clientes usar 0
  let fatorVencimento = formatters.fatorVencimento(boleto['data_vencimento']);
  let valor = formatters.addTrailingZeros(boleto['valor'], 10);
  let carteira = boleto['carteira'];
  let codigoCedente = formatters.addTrailingZeros(boleto['codigo_cedente'], 7);
  let nossoNumero = formatters.addTrailingZeros(boleto['nosso_numero'], 12) + formatters.mod11(boleto['nosso_numero']);
  let barra = codigoBanco + numMoeda + fatorVencimento + valor + fixo + codigoCedente + nossoNumero + ios + carteira;
  let dvBarra = this.dvBarra(barra);
  let lineData = barra.substring(0, 4) + dvBarra + barra.substring(4, barra.length);

  return lineData;
} 

exports.linhaDigitavel = (barcodeData) => {
  // Posição 	Conteúdo
  // 1 a 3    Número do banco
  // 4        Código da Moeda - 9 para Real ou 8 - outras moedas
  // 5        Fixo "9'
  // 6 a 9    PSK - codigo cliente (4 primeiros digitos)
  // 10 a 12  Restante do PSK (3 digitos)
  // 13 a 19  7 primeiros digitos do Nosso Numero
  // 20 a 25  Restante do Nosso numero (8 digitos) - total 13 (incluindo digito verificador)
  // 26 a 26  IOS
  // 27 a 29  Tipo Modalidade Carteira
  // 30 a 30  Dígito verificador do código de barras
  // 31 a 34  Fator de vencimento (qtdade de dias desde 07/10/1997 até a data de vencimento)
  // 35 a 44  Valor do título

  let campos = new Array();

  // 1. Primeiro Grupo - composto pelo código do banco, código da moéda, Valor Fixo "9"
  // e 4 primeiros digitos do PSK (codigo do cliente) e DV (modulo10) deste campo
  let campo = barcodeData.substring(0, 3) + barcodeData.substring(3, 4) + barcodeData.substring(19, 20) + barcodeData.substring(20, 24);
  campo = campo + formatters.mod10(campo);
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length);
  campos.push(campo);

  // 2. Segundo Grupo - composto pelas 3 últimas posiçoes do PSK e 7 primeiros dígitos do Nosso Número
  // e DV (modulo10) deste campo
  let campo = barcodeData.substring(24, 34);
  campo = campo + formatters.mod10(campo);
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length);
  campos.push(campo);

  // 3. Terceiro Grupo - Composto por : Restante do Nosso Numero (6 digitos), IOS, Modalidade da Carteira
  // e DV (modulo10) deste campo
  let campo = barcodeData.substring(34, 44);
  campo = campo + formatters.mod10(campo);
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length);
  campos.push(campo);

  // 4. Campo - digito verificador do codigo de barras
  let campo = barcodeData.substring(4, 5);
  campos.push(campo);

  // 5. Campo composto pelo fator vencimento e valor nominal do documento, sem
  // indicacao de zeros a esquerda e sem edicao (sem ponto e virgula). Quando se
  // tratar de valor zerado, a representacao deve ser 0000000000 (dez zeros).
  let campo = barcodeData.substring(5, 9) + barcodeData.substring(9, 19);
  campos.push(campo);

  return campos.join(" ");
}

exports.parseEDIFile = (fileContent) => {
  try {
    let lines = fileContent.split("\n");
    let parsedFile = {
      boletos: {}
    };

    let currentNossoNumero = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let registro = line.substring(7, 8);

      if (registro == '0') {
        parsedFile['cnpj'] = line.substring(17, 32);
        parsedFile['razao_social'] = line.substring(72, 102);
        parsedFile['agencia_cedente'] = line.substring(32, 36);
        parsedFile['conta_cedente'] = line.substring(37, 47);
        parsedFile['data_arquivo'] = helper.dateFromEdiDate(line.substring(143, 152));
      } else if (registro == '3') {
        let segmento = line.substring(13, 14);

        if (segmento == 'T') {
          let boleto = {};

          boleto['codigo_ocorrencia'] = line.substring(15, 17);
          boleto['vencimento'] = formatters.dateFromEdiDate(line.substring(69, 77));
          boleto['valor'] = formatters.removeTrailingZeros(line.substring(77, 92));
          boleto['tarifa'] = formatters.removeTrailingZeros(line.substring(193, 208));
          boleto['banco_recebedor'] = formatters.removeTrailingZeros(line.substring(92, 95));
          boleto['agencia_recebedora'] = formatters.removeTrailingZeros(line.substring(95, 100));

          currentNossoNumero = formatters.removeTrailingZeros(line.substring(40, 52));
          parsedFile.boletos[currentNossoNumero] = boleto;
        } else if (segmento == 'U') {
          parsedFile.boletos[currentNossoNumero]['valor_pago'] = formatters.removeTrailingZeros(line.substring(77, 92));

          let paid = parsedFile.boletos[currentNossoNumero]['valor_pago'] >= parsedFile.boletos[currentNossoNumero]['valor'];
          paid = paid && parsedFile.boletos[currentNossoNumero]['codigo_ocorrencia'] == '17';

          let boleto = parsedFile.boletos[currentNossoNumero];

          boleto['pago'] = paid;
          boleto['edi_line_number'] = i;
          boleto['edi_line_checksum'] = ediHelper.calculateLineChecksum(line);
          boleto['edi_line_fingerprint'] = boleto['edi_line_number'] + ':' + boleto['edi_line_checksum'];

          currentNossoNumero = null;
        }
      }
    }

    return parsedFile;
  } catch (e) {
    return null;
  }
};