const Simplex = require('./Simplex')
var readline = require('readline')
var cowsay = require('cowsay')
const _ = require('lodash')


// variaveis de ambiente
let config = {
  naoNegativos: '',
  objetiva: [],
  restricao: []
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function clear() {
  // 1. Print empty lines until the screen is blank.
  process.stdout.write('\033[2J')

  // 2. Clear the scrollback.
  process.stdout.write('\u001b[H\u001b[2J\u001b[3J')
}


rl.write("-----------------------------------------------\n")
rl.write("-----------------------------------------------\n")
rl.write("--------- WELCOME TO  SIMPLEX ------------------\n")
rl.write("-----------------------------------------------\n")
rl.write("-----------------------------------------------\n")
rl.write("                                                \n")
rl.write("[1] ADICIONAR FUNÇÃO OBJETIVO  \n")
rl.write("[2] ADICIONAR RESTRIÇÃO  \n")
rl.write("[3] LIMPAR RESTRIÇÕES  \n")
rl.write("[4] ADICIONAR QTD VARIÁVEIS NÃO NEGATIVAS  \n")
rl.write("[5] CALCULAR  \n")
rl.write("[6] AJUDA  \n")
rl.write("[0] SAIR  \n")
rl.write("-----------------------------------------------\n\n")


//pausando para que o server retorne com o model de context
rl.pause()

rl.setPrompt('Selecione uma opção : ');
rl.prompt();

rl.on('line', function (line) {
  switch (line.trim()) {

    // SAINDO DA APLICAÇÃO
    case "0":
      process.exit(0)
      break;

      // ADICIONANDO FUNÇÃO OBJETIVA
    case "1":
      rl.question("Informe a função objetiva: ", function (answer) {
        config.objetiva = answer.split(' ')

        rl.prompt()
      });
      break;

      // ADICIONANDO RESTRIÇÃO
    case "2":
      rl.question("Informe a restrição: ", function (answer) {
        const data = answer.split(' ')
        const lastData = data.pop()

        config.restrincao.push({
          coefficient: data,
          result: lastData
        })

        rl.prompt()
      });
      break;

    // LIMPAR FORMULA DE RESTRIÇÃO
    case "3":
      config.restricao = []
      console.log(`

# RESTRIÇÕES LIMPAS


      `)
      break;

      // ADICIONAR QTD VARIÁVEIS NÃO NEGATIVAS 
    case "4":
      rl.question("Informe a qtd de variáveis não negativas: ", function (answer) {
        config.naoNegativos = parseInt(answer)

        rl.prompt()
      });
      break;

      // CALCULAR
    case "5":
      clear()

      if (_.isEmpty(config.objetiva)) {
        console.log('Preencha  o valor da função objetivo, pressione [1] ')
      } else if (_.isEmpty(config.restricao)) {
        console.log('Preencha  as restrições, pressione [2] ')
      } else if (_.isEmpty(config.naoNegativos)) {
        console.log('Preencha  a quantidade de não negativas, pressione [3] ')
      } else {
        const simplex = new Simplex(config.naoNegativos, config.objetiva, config.restricao)
        simplex.calc()
      }
      break;

      // AJUDA
    case "6":
      console.log(`
=========================================================================================


      # ADICIONANDO RESTRIÇÃO #

      Para poder adicionar uma formula basta escolher a opção e colocar os valores
      separados por espaço. ex:
      
        Formula: 2x1 + x2 - 10x3 <= 20

        Como adicionar no sistema: 2 1 -10 <= 20


------------------------------------------------------------------------------------------

      
      # ADICIONANDO FUNÇÃO OBJETIVO #

      Para poder adicionar uma formUla basta escolher a opção e colocar os valores
      separados por espaço.ex:

        Formula: Z = 2x1 - x3

      Como adicionar no sistema: 2 -1


========================================================================================
                      COMANDOS

    [1] ADICIONAR FUNÇÃO OBJETIVO 
    [2] ADICIONAR RESTRIÇÃO 
    [3] LIMPAR RESTRIÇÕES 
    [4] ADICIONAR QTD VARIÁVEIS NÃO NEGATIVAS 
    [5] CALCULAR 
    [6] AJUDA 
    [0] SAIR 

========================================================================================
      `);
      break;

    default:
      console.log('Commando inválido');
      // clear()
      break;
  }
  rl.prompt();
}).on('close', function () {
  cowsay.say({
    text: "----- flw ------",
    e: "_-",
    T: "I "
  });

  process.exit(0);
});
