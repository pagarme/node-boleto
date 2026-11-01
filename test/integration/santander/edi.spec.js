const chai = require('chai')
chai.use(require('chai-subset'))
chai.use(require('chai-datetime'))
const expect = chai.expect

const ediParser = require('../../../index').EdiParser

const ediFileContent = `
03300000        2018727053000174397800130035168     006404154           PAGAR.ME PAGAMENTOS S/A       BANCO SANTANDER (BRASIL) S/A            206032014      000003040
03376751T01  040 2018727053000174006404154           397800130035168     PAGAR.ME PAGAMENTOS S/A                                                                                       0000000306032014
0337675300001T 17397800130035168        00000000002211               0603201400000000000030034103830                         002000000000000000                                        01300351680000000000003000400000000
0337675300002U 170000000000000000000000000000000000000000000000000000000000000000000000003000000000000003000000000000000000000000000000000603201407032014000000000000000000000000000                              000
0337675300003T 17397800130035168        00000000002301               0603201400000000000035034103830                         002000000000000000                                        01300351680000000000003000400000000
0337675300004U 170000000000000000000000000000000000000000000250000000000000000000000000003250000000000003250000000000000000000000000000000603201407032014000000000000000000000000000                              000
03376755         0000040000010000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000001
03376759         000001000008
`

describe('Santander EDI Parser', () => {
  describe('when parsing a valid EDI file', () => {
    let result
    before(() => {
      result = ediParser.parse('santander', ediFileContent)
    })

    it('should yield correct EDI file properties', () => {
      expect(result).to.containSubset({
        cnpj: '018727053000174',
        razao_social: 'PAGAR.ME PAGAMENTOS S/A       ',
        agencia_cedente: '3978',
        conta_cedente: '0130035168'
      })
    })

    it('should parse EDI dates correctly', () => {
      expect(result.data_arquivo).to.equalDate(new Date(2014, 2, 6))
    })

    it('should parse boletos correctly', () => {
      expect(result.boletos).to.containSubset({
        22: {
          codigo_ocorrencia: '17',
          valor: '300',
          tarifa: '300',
          banco_recebedor: '341',
          agencia_recebedora: '3830',
          valor_pago: '300',
          pago: true,
          edi_line_number: 4,
          edi_line_checksum: 'ca06c2930a187fcf40bf5a86f0f7b0a7be334fae',
          edi_line_fingerprint: '4:ca06c2930a187fcf40bf5a86f0f7b0a7be334fae'
        },
        23: {
          codigo_ocorrencia: '17',
          valor: '350',
          tarifa: '300',
          banco_recebedor: '341',
          agencia_recebedora: '3830',
          valor_pago: '325',
          pago: false,
          edi_line_number: 6,
          edi_line_checksum: '7b982a98589d0a51934a35a464db7a3a43ef30c6',
          edi_line_fingerprint: '6:7b982a98589d0a51934a35a464db7a3a43ef30c6'
        }
      })
    })

    it('should parse boleto vencimentos correctly', () => {
      expect(result.boletos['22'].vencimento).to.equalDate(new Date(2014, 2, 6))
      expect(result.boletos['23'].vencimento).to.equalDate(new Date(2014, 2, 6))
    })
  })
})


describe('Santander EDI Parser - paid detection', () => {
  const withAmounts = (titleAmount, paidAmount) => {
    const lines = ediFileContent.split('\n')
    const titleIndex = lines.findIndex((line) => line.substring(7, 8) === '3' && line.substring(13, 14) === 'T')
    const paidIndex = titleIndex + 1
    const setAmount = (line, amount) => line.substring(0, 77) + amount.padStart(15, '0') + line.substring(92)

    lines[titleIndex] = setAmount(lines[titleIndex], titleAmount)
    lines[paidIndex] = setAmount(lines[paidIndex], paidAmount)

    return ediParser.parse('santander', lines.join('\n'))
  }

  it('marks a title as paid when the paid amount is larger and has more digits', () => {
    const result = withAmounts('900', '1000')
    expect(Object.values(result.boletos)[0].pago).to.be.true
  })

  it('does not mark a title as paid when the paid amount is smaller and has fewer digits', () => {
    const result = withAmounts('1000', '900')
    expect(Object.values(result.boletos)[0].pago).to.be.false
  })
})
