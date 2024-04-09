const { expect } = require('chai')

const { fatorVencimento } = require('../../lib/formatters')

describe('Formatters', () => {
  describe('Fator de Vencimento', () => {
    const dates = [
      {
        data_vencimento: '2025-01-01',
        factor: '9948'
      },
      {
        data_vencimento: '2025-01-01',
        factor: '9948'
      },
      {
        data_vencimento: '2025-02-20',
        factor: '9998'
      },
      {
        data_vencimento: '2025-02-21',
        factor: '9999'
      },
      {
        data_vencimento: '2025-02-22',
        factor: '1000'
      },
      {
        data_vencimento: '2025-02-23',
        factor: '1001'
      },
      {
        data_vencimento: '2025-12-31',
        factor: '1312'
      },
      {
        data_vencimento: '2027-11-18',
        factor: '1999'
      },
      {
        data_vencimento: '2027-11-19',
        factor: '2000'
      },
      {
        data_vencimento: '2039-04-27',
        factor: '6177'
      },
      {
        data_vencimento: '2049-10-13',
        factor: '9999'
      }
    ]

    dates.forEach((data) => {
      it(`get the expected factor with the date '${data.data_vencimento}'`, () => {
        const factorReceived = fatorVencimento(data.data_vencimento)

        expect(factorReceived).to.be.equal(data.factor)
      })
    })
  })
})
