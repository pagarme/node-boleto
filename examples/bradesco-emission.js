const express = require('express')
const path = require('path')

const app = express()

const Boleto = require('../index').Boleto

const boleto = new Boleto({
  'banco': 'bradesco',
  'data_emissao': new Date(),
  'data_vencimento': new Date(new Date().getTime() + 5 * 24 * 3600 * 1000),
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
})

// console.log(boleto['linha_digitavel']);

app.use(express.static(path.join(__dirname, '/../')))

app.get('/', function (req, res) {
  boleto.renderHTML(function (html) {
    return res.send(html)
  })
})

app.listen(3003)
