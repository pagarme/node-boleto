const chai = require('chai')
chai.use(require('chai-subset'))
chai.use(require('chai-datetime'))
const expect = chai.expect

const ediParser = require('../../../index').EdiParser

const ediFileContent = `
02RETORNO01COBRANCA       4497740603          xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  104C ECON FEDERAL 251120                                                                                                                                                                                                                                                                                                 00618000001
10233649575000199449774060320  011904689                14000000000011834                                 0121251120011904689                     261120000000004611610408575090000000000300004102271120              0000000000000000000000000000000000000000000000046116000000000000000000000000001271120                                                                                               000002
10233649575000199449774060320  013741801                14000000000011835                                 0121251120013741801                     281120000000001798010400174090000000000300006102271120              0000000000000000000000000000000000000000000000017980000000000000000000000000001271120                                                                                               000003`

describe('Caixa EDI Parser', () => {
  describe('when parsing a valid EDI file', () => {
    let result
    let boleto
    let boleto2
    before(() => {
      result = ediParser.parse('caixa', ediFileContent)
      boleto = result.boletos[0]
      boleto2 = result.boletos[1]
    })

    it('should have found 2 boletos', () => {
      expect(result.boletos).to.have.lengthOf(2)
    })

    it('should parse boleto correctly', () => {
      expect(boleto).to.containSubset({
        codigo_ocorrencia: '21',
        motivos_ocorrencia: '',
        valor_pago: '46116',
        valor: '46116',
        iof_devido: '',
        abatimento_concedido: '',
        desconto_concedido: '',
        juros_mora: '',
        outros_creditos: '',
        banco_recebedor: '104',
        agencia_recebedora: '8575',
        paid: true,
        edi_line_number: 2,
        edi_line_checksum: '3310496178977da1288d047339a88a08735b1f60',
        edi_line_fingerprint: '2:3310496178977da1288d047339a88a08735b1f60',
        nosso_numero: '11834'
      })
    })

    it('should parse boleto2 correctly', () => {
      expect(boleto2).to.containSubset({
        codigo_ocorrencia: '21',
        motivos_ocorrencia: '',
        valor_pago: '17980',
        valor: '17980',
        iof_devido: '',
        abatimento_concedido: '',
        desconto_concedido: '',
        juros_mora: '',
        outros_creditos: '',
        banco_recebedor: '104',
        agencia_recebedora: '174',
        paid: true,
        edi_line_number: 3,
        edi_line_checksum: '8b535f53e0f872f9c68aaf2aa7e41fae6d4c7d0e',
        edi_line_fingerprint: '3:8b535f53e0f872f9c68aaf2aa7e41fae6d4c7d0e',
        nosso_numero: '11835'
      })
    })

    it('should parse boleto data_ocorrencia correctly', () => {
      expect(boleto.data_ocorrencia).to.equalDate(new Date(2020, 10, 25))
    })

    it('should parse boleto data_credito correctly', () => {
      expect(boleto.data_credito).to.equalDate(new Date(2020, 10, 27))
    })

    it('should parse boleto vencimento correctly', () => {
      expect(boleto.vencimento).to.equalDate(new Date(2020, 10, 26))
    })

    it('should parse EDI properties correctly', () => {
      expect(result).to.containSubset({
        razao_social: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ',
        cnpj: '33649575000199',
        carteira: '1',
        conta_cedente: '740603'
      })

      it('should parse EDI dates correctly', () => {
        expect(result.data_arquivo).to.equalDate(new Date(2020, 10, 25))
      })
    })
  })
})
