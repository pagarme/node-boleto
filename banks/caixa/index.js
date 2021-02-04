const formatters = require('../../lib/formatters')
const ediHelper = require('../../lib/edi-helper')

exports.parseEDIFile = function (fileContent) {
  try {
    const lines = fileContent.split('\n')
    const parsedFile = {
      boletos: []
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const registro = line.substring(0, 1)
      const inscricao = line.substring(1, 3)

      if (registro === '0') {
        parsedFile['razao_social'] = line.substring(46, 76)
        parsedFile['data_arquivo'] = ediHelper.dateFromEdiDate(line.substring(94, 100))
      } else if (registro === '1' && inscricao === '01' || inscricao === '02') {
        const boleto = {}

        parsedFile['cnpj'] = formatters.removeTrailingZeros(line.substring(3, 17))
        parsedFile['carteira'] = formatters.removeTrailingZeros(line.substring(106, 108))
        parsedFile['agencia_cedente'] = formatters.removeTrailingZeros(line.substring(17, 21))
        parsedFile['conta_cedente'] = formatters.removeTrailingZeros(line.substring(21, 27))

        boleto['codigo_ocorrencia'] = line.substring(108, 110)

        const motivosOcorrencia = line.substring(79, 82).trim()

        let isPaid = (parseInt(boleto['valor_pago']) >= parseInt(boleto['valor']) || boleto['codigo_ocorrencia'] === '21')

        if (motivosOcorrencia !== '') {
          isPaid = false
        }

        boleto['motivos_ocorrencia'] = motivosOcorrencia
        boleto['data_ocorrencia'] = ediHelper.dateFromEdiDate(line.substring(110, 116))
        boleto['data_credito'] = ediHelper.dateFromEdiDate(line.substring(293, 299))
        boleto['vencimento'] = ediHelper.dateFromEdiDate(line.substring(146, 152))
        boleto['valor'] = formatters.removeTrailingZeros(line.substring(152, 165))
        boleto['banco_recebedor'] = formatters.removeTrailingZeros(line.substring(165, 168))
        boleto['agencia_recebedora'] = formatters.removeTrailingZeros(line.substring(168, 173))
        boleto['paid'] = isPaid
        boleto['edi_line_number'] = i
        boleto['edi_line_checksum'] = ediHelper.calculateLineChecksum(line)
        boleto['edi_line_fingerprint'] = boleto['edi_line_number'] + ':' + boleto['edi_line_checksum']
        boleto['nosso_numero'] = formatters.removeTrailingZeros(line.substring(58, 73))
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
