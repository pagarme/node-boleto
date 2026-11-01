const chai = require('chai')
chai.use(require('chai-subset'))
chai.use(require('chai-datetime'))
const expect = chai.expect

const ediParser = require('../../../index').EdiParser

const ediFileContent = `
02RETORNO01COBRANCA       00000000000004628596PAGAR.ME PAGAMENTOS S.A.      237BRADESCO       2005160160000000001                                                                                                                                                                                                                                                                          220514         000001
1021872705300017400000250122900004693                         000000000000000000600000000000000000000000000506200516          00000000000000000000000000000000000150034103830  000000000000000000000000000000000000100000000000020000000000003000000000000400000000000010000000000005000000000000600   210516             00000000000000                                                                  000002
1021872705300017400000260122900004693                         00000000000278613362000000000000000000000000060610041927861336  00000000000278613362090419000000000060934100262  000000000000000000000000000000000000000000000000000000000000000000000000000000000000000071400000000001050000000000000   110419             00000000000000                                                                  152328
9201237          000000010000000000150000000001          00000000000000000000000000500000010000000005000000000000000000000000000000000000000000000000000000000000000000000000000000000000000                                                                                                                                                                              00000000000000000000000         000003`

describe('Bradesco EDI Parser', () => {
  describe('when parsing a valid EDI file', () => {
    let result
    let boleto
    let boleto2
    before(() => {
      result = ediParser.parse('bradesco', ediFileContent)
      boleto = result.boletos[0]
      boleto2 = result.boletos[1]
    })

    it('should have found 2 boletos', () => {
      expect(result.boletos).to.have.lengthOf(2)
    })

    it('should parse boleto correctly', () => {
      expect(boleto).to.containSubset({
        codigo_ocorrencia: '06',
        motivos_ocorrencia: [
          '00',
          '00',
          '00',
          '00',
          '00'
        ],
        valor_pago: '100',
        valor: '1500',
        juros_operacao_em_atraso: '100',
        iof_devido: '200',
        abatimento_concedido: '300',
        desconto_concedido: '400',
        juros_mora: '500',
        outros_creditos: '600',
        banco_recebedor: '341',
        agencia_recebedora: '3830',
        paid: true,
        edi_line_number: 2,
        edi_line_checksum: '20c5b6ebeb167ffb24ebe64316a3433a193de0bf',
        edi_line_fingerprint: '2:20c5b6ebeb167ffb24ebe64316a3433a193de0bf',
        nosso_numero: '6',
        raw_line: '1021872705300017400000250122900004693                         000000000000000000600000000000000000000000000506200516          00000000000000000000000000000000000150034103830  000000000000000000000000000000000000100000000000020000000000003000000000000400000000000010000000000005000000000000600   210516             00000000000000                                                                  000002'
      })
    })

    it('should parse boleto2 correctly', () => {
      expect(boleto2).to.containSubset({
        codigo_ocorrencia: '06',
        motivos_ocorrencia: [
          '00',
          '00',
          '00',
          '00',
          '00'
        ],
        valor_pago: '714',
        valor: '609',
        juros_operacao_em_atraso: '',
        iof_devido: '',
        abatimento_concedido: '',
        desconto_concedido: '',
        juros_mora: '105',
        outros_creditos: '',
        banco_recebedor: '341',
        agencia_recebedora: '262',
        paid: true,
        edi_line_number: 3,
        edi_line_checksum: '686bf39b5d6533b49466e78391d1eeb593cb0db4',
        edi_line_fingerprint: '3:686bf39b5d6533b49466e78391d1eeb593cb0db4',
        nosso_numero: '27861336',
        raw_line: '1021872705300017400000260122900004693                         00000000000278613362000000000000000000000000060610041927861336  00000000000278613362090419000000000060934100262  000000000000000000000000000000000000000000000000000000000000000000000000000000000000000071400000000001050000000000000   110419             00000000000000                                                                  152328'
      })
    })

    it('should parse boleto data_ocorrencia correctly', () => {
      expect(boleto.data_ocorrencia).to.equalDate(new Date(2016, 4, 20))
    })

    it('should parse boleto data_credito correctly', () => {
      expect(boleto.data_credito).to.equalDate(new Date(2016, 4, 21))
    })

    it('should parse boleto vencimento correctly', () => {
      expect(boleto.vencimento).to.equalDate(new Date(2016, 4, 20))
    })

    it('should parse EDI properties correctly', () => {
      expect(result).to.containSubset({
        razao_social: 'PAGAR.ME PAGAMENTOS S.A.      ',
        cnpj: '18727053000174',
        carteira: '26',
        agencia_cedente: '1229',
        conta_cedente: '4693'
      })

      it('should parse EDI dates correctly', () => {
        expect(result.data_arquivo).to.equalDate(new Date(2016, 4, 20))
      })
    })
  })
})


describe('Bradesco EDI Parser - paid detection', () => {
  it('marks a title as paid when the paid amount reaches the title amount, even with a non-liquidation occurrence code', () => {
    const lines = ediFileContent.split('\n')
    const index = lines.findIndex((line) => line.substring(0, 1) === '1' && line.substring(108, 110) === '06')
    let line = lines[index]

    // '02' is not a liquidation code, and the paid amount (positions 254-266)
    // is set to the title amount (positions 153-165) of the same line.
    line = line.substring(0, 108) + '02' + line.substring(110)
    line = line.substring(0, 253) + line.substring(152, 165) + line.substring(266)
    lines[index] = line

    const result = ediParser.parse('bradesco', lines.join('\n'))

    expect(result.boletos[0]).to.containSubset({
      codigo_ocorrencia: '02',
      valor: '1500',
      valor_pago: '1500',
      paid: true
    })
  })
})
