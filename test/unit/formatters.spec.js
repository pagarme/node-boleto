const chai = require('chai')

chai.use(require('chai-subset'))
chai.use(require('chai-datetime'))

const expect = chai.expect

const { fatorVencimento } = require('../../lib/formatters')

describe('Formatters', () => {
  describe('Fator de Vencimento', () => {
    const dates = [
      ['2025-01-01', '9948'],
      ['2025-02-20', '9998'],
      ['2025-02-21', '9999'],
      ['2025-02-22', '1000'],
      ['2025-02-23', '1001'],
      ['2025-12-31', '1312'],
      ['2027-11-18', '1999'],
      ['2027-11-19', '2000'],
      ['2039-04-27', '6177'],
      ['2049-10-13', '9999']
    ]

    dates.map(([date, diffDays]) => {
      it(`get the expected factor with the date '${date}'`, () => {
        const factor = fatorVencimento(date)

        expect(factor).to.be.equal(diffDays)
      })
    })
  })
})
