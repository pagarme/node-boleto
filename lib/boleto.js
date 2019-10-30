const ejs = require('ejs')
const formatters = require('./formatters')
const barcode = require('./barcode')
const path = require('path')
const moment = require('moment')

let banks = null

const hashString = function (string) {
  let hash = 0
  let i
  let chr
  let len

  if (string.length == 0) return hash
  for (i = 0, len = string.length; i < len; i++) {
    chr = string.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

const Boleto = function (options) {
  if (!options) {
    throw 'No options provided initializing Boleto.'
  }

  this.bank = banks[options['banco']]
  if (!this.bank) {
    throw 'Invalid bank.'
  }

  if (!options['data_emissao']) {
    options['data_emissao'] = moment().utc()
  } else {
    options['data_emissao'] = moment(moment(options['data_emissao']).utc().format('YYYY-MM-DD'))
  }

  if (!options['data_vencimento']) {
    options['data_vencimento'] = moment().utc().add('5', 'days')
  } else {
    options['data_vencimento'] = moment(moment(options['data_vencimento']).utc().format('YYYY-MM-DD'))
  }

  for (let key in options) {
    this[key] = options[key]
  }

  this['pagador'] = formatters.htmlString(this['pagador'])
  this['instrucoes'] = formatters.htmlString(this['instrucoes'])

  if (!this['local_de_pagamento']) {
    this['local_de_pagamento'] = 'Até o vencimento, preferencialmente no Banco ' + formatters.capitalize(this['banco'])
  }

  this._calculate()
}

Boleto.barcodeRenderEngine = 'img'

Boleto.prototype._calculate = function () {
  this['codigo_banco'] = this.bank.options.codigo + '-' + formatters.mod11(this.bank.options.codigo)
  this['nosso_numero_dv'] = formatters.mod11(this['nosso_numero'].toString())
  this['barcode_data'] = this.bank.barcodeData(this)
  this['linha_digitavel'] = this.bank.linhaDigitavel(this['barcode_data'])
}

Boleto.prototype.renderHTML = function (callback) {
  const self = this

  let renderOptions = self.bank.options
  renderOptions.boleto = self

  // Copy renderHelper's methods to renderOptions
  for (let key in formatters) {
    renderOptions[key] = formatters[key]
  }

  renderOptions['barcode_render_engine'] = Boleto.barcodeRenderEngine
  renderOptions['barcode_height'] = '50'

  if (Boleto.barcodeRenderEngine == 'bmp') {
    renderOptions['barcode_data'] = barcode.bmpLineForBarcodeData(self['barcode_data'])
  } else if (Boleto.barcodeRenderEngine == 'img') {
    renderOptions['barcode_data'] = barcode.binaryRepresentationForBarcodeData(self['barcode_data'])
  }

  renderOptions['boleto']['linha_digitavel_hash'] = hashString(renderOptions['boleto']['linha_digitavel']).toString()

  ejs.renderFile(path.join(__dirname, '/../assets/layout.ejs'), renderOptions, {
    cache: true
  }, function (err, html) {
    if (err) {
      throw new Error(err)
    }

    callback(html)
  })
}

module.exports = function (_banks) {
  banks = _banks
  return Boleto
}
