const Boleto = require('../../../index').Boleto
const moment = require('moment')
const expect = require('chai').expect

describe('Bradesco Boleto', () => {
  describe('when creating a valid boleto', () => {
    let boletos = [
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': moment('2017-01-01T00:00:00Z').valueOf(),
          'data_vencimento': moment('2017-01-05T00:00:00Z').valueOf(),
          'valor': 1500,
          'nosso_numero': '6',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '1229',
          'codigo_cedente': '469',
          'carteira': '25',
          'pagador': 'Nome do pagador\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23794703000000015001229250000000000600004690',
        linha_digitavel:
        '23791.22928 50000.000005 06000.046901 4 70300000001500'
      },
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': moment('2017-01-01T00:00:00Z').toDate(),
          'data_vencimento': moment('2017-01-05T01:00:00Z').toDate(),
          'valor': 1500,
          'nosso_numero': '6',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '1229',
          'codigo_cedente': '469',
          'carteira': '25',
          'pagador': 'Nome do pagador\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23794703000000015001229250000000000600004690',
        linha_digitavel: '23791.22928 50000.000005 06000.046901 4 70300000001500'
      },
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': moment('2017-01-01T00:00:00Z').format(),
          'data_vencimento': moment('2017-01-05T02:00:00Z').format(),
          'valor': 1500,
          'nosso_numero': '6',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '1229',
          'codigo_cedente': '469',
          'carteira': '25',
          'pagador': 'Nome do pagador\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23794703000000015001229250000000000600004690',
        linha_digitavel: '23791.22928 50000.000005 06000.046901 4 70300000001500'
      },
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': new Date('2017-01-01T23:00:00Z').getTime(),
          'data_vencimento': new Date('2017-01-05T23:00:00Z').getTime(),
          'valor': 1500,
          'nosso_numero': '6',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '1229',
          'codigo_cedente': '469',
          'carteira': '25',
          'pagador': 'Nome do pagador\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23794703000000015001229250000000000600004690',
        linha_digitavel: '23791.22928 50000.000005 06000.046901 4 70300000001500'
      },
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': new Date('2017-01-01T00:00:00Z').getTime(),
          'data_vencimento': new Date('2017-01-05T00:00:00Z').getTime(),
          'valor': 1500,
          'nosso_numero': '6',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '1229',
          'codigo_cedente': '469',
          'carteira': '25',
          'pagador': 'Nome do pagador\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23794703000000015001229250000000000600004690',
        linha_digitavel: '23791.22928 50000.000005 06000.046901 4 70300000001500'
      },
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': new Date('2024-04-05T00:00:00Z').getTime(),
          'data_vencimento': new Date('2025-02-23T12:35:46Z').getTime(),
          'valor': 200,
          'nosso_numero': '00056631487',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '0001',
          'codigo_cedente': '1234567',
          'carteira': '25',
          'pagador': 'Ramon\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23798100100000002000001250005663148712345670',
        linha_digitavel: '23790.00124 50005.663146 87123.456706 8 10010000000200'
      },
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': new Date('2024-04-05T00:00:00Z').getTime(),
          'data_vencimento': new Date('2027-11-19T12:35:46Z').getTime(),
          'valor': 200,
          'nosso_numero': '00022019139',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '0001',
          'codigo_cedente': '1234567',
          'carteira': '25',
          'pagador': 'Ramon\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23792200000000002000001250002201913912345670',
        linha_digitavel: '23790.00124 50002.201916 39123.456707 2 20000000000200'
      },
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': new Date('2024-04-05T00:00:00Z').getTime(),
          'data_vencimento': new Date('2027-11-18T12:35:46Z').getTime(),
          'valor': 200,
          'nosso_numero': '00075507288',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '0001',
          'codigo_cedente': '1234567',
          'carteira': '25',
          'pagador': 'Ramon\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23797199900000002000001250007550728812345670',
        linha_digitavel: '23790.00124 50007.550721 88123.456704 7 19990000000200'
      },
      {
        boleto: new Boleto({
          'banco': 'bradesco',
          'data_emissao': new Date('2024-04-05T00:00:00Z').getTime(),
          'data_vencimento': new Date('2049-10-13T12:35:46Z').getTime(),
          'valor': 200,
          'nosso_numero': '00036084454',
          'numero_documento': '1',
          'cedente': 'Pagar.me Pagamentos S/A',
          'cedente_cnpj': '18727053000174',
          'agencia': '0001',
          'codigo_cedente': '1234567',
          'carteira': '25',
          'pagador': 'Ramon\nCPF: 000.000.000-00',
          'local_de_pagamento': 'PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.',
          'instrucoes': 'Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.'
        }),
        barcode: '23794999900000002000001250003608445412345670',
        linha_digitavel: '23790.00124 50003.608440 54123.456706 4 99990000000200'
      }
    ]

    it('contains correct bank options', () => {
      boletos.forEach(({boleto}) => {
        expect(boleto.bank.options).to.have.property('logoURL').that.contains('bradesco.jpg')
        expect(boleto.bank.options).to.have.property('codigo', '237')
      })
    })

    it('contains correct codigo_banco', () => {
      boletos.forEach(({boleto}) => {
        expect(boleto.codigo_banco).to.equal('237-2')
      })
    })

    it('contains correct barcode_data', () => {
      boletos.forEach(({boleto, barcode}) => {
        expect(boleto.barcode_data).to.equal(barcode)
      })
    })

    it('contains correct linha_digitavel', () => {
      boletos.forEach((boleto) => {
        expect(boleto.boleto.linha_digitavel).to.equal(boleto.linha_digitavel)
      })
    })
  })
})
