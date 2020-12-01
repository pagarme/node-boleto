const moment = require('moment')
var formatters = require('../../lib/formatters')
var ediHelper = require('../../lib/edi-helper')

exports.options = {
  logoURL: 'https://assets.pagar.me/boleto/images/bradesco.jpg',
  codigo: '237'
}

exports.dvBarra = function (barra) {
  var resto2 = formatters.mod11(barra, 9, 1)
  return (resto2 == 0 || resto2 == 1 || resto2 == 10) ? 1 : 11 - resto2
}

exports.barcodeData = function (boleto) {
  var codigoBanco = this.options.codigo
  var numMoeda = '9'

  var fatorVencimento = formatters.fatorVencimento(moment(boleto['data_vencimento']).utc().format())

  var agencia = formatters.addTrailingZeros(boleto['agencia'], 4)

  var valor = formatters.addTrailingZeros(boleto['valor'], 10)
  var carteira = boleto['carteira']
  var codigoCedente = formatters.addTrailingZeros(boleto['codigo_cedente'], 7)

  var nossoNumero = carteira + formatters.addTrailingZeros(boleto['nosso_numero'], 11)

  var barra = codigoBanco + numMoeda + fatorVencimento + valor + agencia + nossoNumero + codigoCedente + '0'

  var dvBarra = this.dvBarra(barra)
  var lineData = barra.substring(0, 4) + dvBarra + barra.substring(4, barra.length)

  return lineData
}

exports.linhaDigitavel = function (barcodeData) {
  // 01-03    -> Código do banco sem o digito
  // 04-04    -> Código da Moeda (9-Real)
  // 05-05    -> Dígito verificador do código de barras
  // 06-09    -> Fator de vencimento
  // 10-19    -> Valor Nominal do Título
  // 20-44    -> Campo Livre (Abaixo)
  // 20-23    -> Código da Agencia (sem dígito)
  // 24-05    -> Número da Carteira
  // 26-36    -> Nosso Número (sem dígito)
  // 37-43    -> Conta do Cedente (sem dígito)
  // 44-44    -> Zero (Fixo)

  var campos = []

  // 1. Campo - composto pelo código do banco, código da moéda, as cinco primeiras posições
  // do campo livre e DV (modulo10) deste campo
  var campo = barcodeData.substring(0, 3) + barcodeData.substring(3, 4) + barcodeData.substring(19, 20) + barcodeData.substring(20, 24)
  campo = campo + formatters.mod10(campo)
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length)
  campos.push(campo)

  // 2. Campo - composto pelas posiçoes 6 a 15 do campo livre
  // e livre e DV (modulo10) deste campo
  campo = barcodeData.substring(24, 34)
  campo = campo + formatters.mod10(campo)
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length)
  campos.push(campo)

  // 3. Campo composto pelas posicoes 16 a 25 do campo livre
  // e livre e DV (modulo10) deste campo
  campo = barcodeData.substring(34, 44)
  campo = campo + formatters.mod10(campo)
  campo = campo.substring(0, 5) + '.' + campo.substring(5, campo.length)
  campos.push(campo)

  // 4. Campo - digito verificador do codigo de barras
  campo = barcodeData.substring(4, 5)
  campos.push(campo)

  // 5. Campo composto pelo fator vencimento e valor nominal do documento, sem
  // indicacao de zeros a esquerda e sem edicao (sem ponto e virgula). Quando se
  // tratar de valor zerado, a representacao deve ser 000 (tres zeros).
  campo = barcodeData.substring(5, 9) + barcodeData.substring(9, 19)
  campos.push(campo)

  return campos.join(' ')
}

exports.parseEDIFile = function (fileContent) {
  try {
    var lines = fileContent.split('\n')
    var parsedFile = {
      boletos: []
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i]
      var registro = line.substring(0, 1)

      if (registro == '0') {
        parsedFile['razao_social'] = line.substring(46, 76)
        parsedFile['data_arquivo'] = ediHelper.dateFromEdiDate(line.substring(94, 100))
      } else if (registro == '1') {
        var boleto = {}

        parsedFile['cnpj'] = formatters.removeTrailingZeros(line.substring(3, 17))
        parsedFile['carteira'] = formatters.removeTrailingZeros(line.substring(22, 24))
        parsedFile['agencia_cedente'] = formatters.removeTrailingZeros(line.substring(24, 29))
        parsedFile['conta_cedente'] = formatters.removeTrailingZeros(line.substring(29, 37))

        boleto['codigo_ocorrencia'] = line.substring(108, 110)

        var ocorrenciasStr = line.substring(318, 328)
        var motivosOcorrencia = []
        var isPaid = (parseInt(boleto['valor_pago']) >= parseInt(boleto['valor']) || boleto['codigo_ocorrencia'] == '06')

        for (var j = 0; j < ocorrenciasStr.length; j += 2) {
          var ocorrencia = ocorrenciasStr.substr(j, 2)
          motivosOcorrencia.push(ocorrencia)

          if (ocorrencia != '00') {
            isPaid = false
          }
        }

        boleto['motivos_ocorrencia'] = motivosOcorrencia
        boleto['data_ocorrencia'] = ediHelper.dateFromEdiDate(line.substring(110, 116))
        boleto['data_credito'] = ediHelper.dateFromEdiDate(line.substring(295, 301))
        boleto['vencimento'] = ediHelper.dateFromEdiDate(line.substring(110, 116))
        boleto['valor'] = formatters.removeTrailingZeros(line.substring(152, 165))
        boleto['banco_recebedor'] = formatters.removeTrailingZeros(line.substring(165, 168))
        boleto['agencia_recebedora'] = formatters.removeTrailingZeros(line.substring(168, 173))
        boleto['paid'] = isPaid
        boleto['edi_line_number'] = i
        boleto['edi_line_checksum'] = ediHelper.calculateLineChecksum(line)
        boleto['edi_line_fingerprint'] = boleto['edi_line_number'] + ':' + boleto['edi_line_checksum']
        boleto['nosso_numero'] = formatters.removeTrailingZeros(line.substring(70, 81))

        boleto['juros_operacao_em_atraso'] = formatters.removeTrailingZeros(line.substring(201, 214))
        boleto['iof_devido'] = formatters.removeTrailingZeros(line.substring(214, 227))
        boleto['abatimento_concedido'] = formatters.removeTrailingZeros(line.substring(227, 240))
        boleto['desconto_concedido'] = formatters.removeTrailingZeros(line.substring(240, 253))
        boleto['valor_pago'] = formatters.removeTrailingZeros(line.substring(253, 266))
        boleto['juros_mora'] = formatters.removeTrailingZeros(line.substring(266, 279))
        boleto['outros_creditos'] = formatters.removeTrailingZeros(line.substring(279, 292))

        parsedFile.boletos.push(boleto)
      }
    }

    return parsedFile
  } catch (e) {
    console.log(e)
    return null
  }
}
