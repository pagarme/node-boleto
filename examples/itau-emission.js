var express = require('express');

var app = express();

var Boleto = require('../index').Boleto;

var boleto = new Boleto({
  'banco': "itau",
  'data_emissao': new Date(),
  'data_vencimento': new Date(new Date().getTime() + 5 * 24 * 3600 * 1000),
  'valor': 1500,
  'nosso_numero': "6",
  'numero_documento': "1",
  'cedente': "Pagar.me Pagamentos S/A",
  'cedente_cnpj': "18727053000174",
  'agencia': "1229",
  'codigo_cedente': "469",
  'carteira': "174", //175, 174, 104, 109, 178, ou 157
  'pagador': "Nome do pagador\nCPF: 000.000.000-00",
  'local_de_pagamento': "PAGÁVEL EM QUALQUER BANCO ATÉ O VENCIMENTO.",
  'instrucoes': "Sr. Caixa, aceitar o pagamento e não cobrar juros após o vencimento.",
})

// console.log(boleto['linha_digitavel']);

app.use(express.static(__dirname + '/../'));

app.get('/', function (req, res) {
  boleto.renderHTML(function (html) {
    return res.send(html);
  });
});

app.listen(3003);
