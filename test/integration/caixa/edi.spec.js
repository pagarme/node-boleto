const chai = require('chai')
chai.use(require('chai-subset'))
chai.use(require('chai-datetime'))
const expect = chai.expect

const ediParser = require('../../../index').EdiParser

const ediFileContent = `
02RETORNO01COBRANCA       33371103388         PAGAR.ME PAGAMENTOS S.A.      104C ECON FEDERAL 010221                                                          007                                                                                                                                                                                                                                    00035000001
10218727053000174   110338820  73110483                 14000000073110483                                 012101022173110483                      080221000000000011310408575090000000000115004101020221              0000000000000000000000000000000000000000000000000113000000000000000000000000001020221                                                                                               000002
10218727053000174   110338820                           14000000073110483                                 010101022173110483                      080221000000000011310400235090000000000000000000010221              0000000000000000000000000000000000000000000000000000000000000000000000000000001000000                                                                                               000003
10000000000000000   110338800                           00000000000000000                                 0234010221                              000000000000000000010400000090000000000000000000010221              0000000000000000000000000000000000000000000000000000000000000000000000000000000000000                                                                                               000004
9201104                                                                                                                                                                                                                                                                                                                                                                                                   000005`

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
        valor_pago: '113',
        valor: '113',
        iof_devido: '',
        abatimento_concedido: '',
        desconto_concedido: '',
        juros_mora: '',
        outros_creditos: '',
        banco_recebedor: '104',
        agencia_recebedora: '8575',
        paid: true,
        edi_line_number: 2,
        edi_line_checksum: '63b840504d94be3e264437f18a90ed7cd79ce4ed',
        edi_line_fingerprint: '2:63b840504d94be3e264437f18a90ed7cd79ce4ed',
        nosso_numero: '73110483'
      })
    })

    it('should parse boleto2 correctly', () => {
      expect(boleto2).to.containSubset({
        codigo_ocorrencia: '01',
        motivos_ocorrencia: '',
        valor_pago: '',
        valor: '113',
        iof_devido: '',
        abatimento_concedido: '',
        desconto_concedido: '',
        juros_mora: '',
        outros_creditos: '',
        banco_recebedor: '104',
        agencia_recebedora: '235',
        paid: false,
        edi_line_number: 3,
        edi_line_checksum: '1cab47fa2079068396aa5a3b1c4ccec59d1880be',
        edi_line_fingerprint: '3:1cab47fa2079068396aa5a3b1c4ccec59d1880be',
        nosso_numero: '73110483'
      })
    })

    it('should parse boleto data_ocorrencia correctly', () => {
      expect(boleto.data_ocorrencia).to.equalDate(new Date(2021, 1, 1))
    })

    it('should parse boleto data_credito correctly', () => {
      expect(boleto.data_credito).to.equalDate(new Date(2021, 1, 2))
    })

    it('should parse boleto vencimento correctly', () => {
      expect(boleto.vencimento).to.equalDate(new Date(2021, 1, 8))
    })

    it('should parse EDI properties correctly', () => {
      expect(result).to.containSubset({
        razao_social: 'PAGAR.ME PAGAMENTOS S.A.      ',
        cnpj: '18727053000174',
        carteira: '1',
        conta_cedente: '103388'
      })

      it('should parse EDI dates correctly', () => {
        expect(result.data_arquivo).to.equalDate(new Date(2021, 1, 1))
      })
    })
  })
})
