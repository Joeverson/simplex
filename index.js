const Simplex = require('./Simplex')
var readline = require('readline')
var cowsay = require('cowsay')
const _ = require('lodash')


// variaveis de ambiente
let config = {
  naoNegativos:  2,
  objetiva:  [1, 2],
  restrincao:  [{
      coefficient: [-4, 1],
      result: 4
    },
    {
      coefficient: [2, -3],
      result: 6
    }
  ]
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function clear () {
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
rl.write("[1] ADICIONAR FORMULA OBJETIVA  \n")
rl.write("[2] ADICIONAR FORMULA DE RESTRINCÃO  \n")
rl.write("[3] LIMPAR FORMULAS DE RESTRINÇÕES  \n")
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

    // ADICIONANDO FORMULA OBJETIVA
    case "1":
      rl.question("Informe a formula objetiva: ", function (answer) {
        config.objetiva = answer.split(' ')
        
        rl.prompt()
      });
      break;

    // ADICIONANDO FORMULA DE RESTRINÇÃO
    case "2":
      rl.question("Informe a formula restrinções: ", function (answer) {
        const data = answer.split(' ')
        const lastData = data.pop()
        
        config.restrincao.push({
          coefficient: data,
          result: lastData
        })
        
        rl.prompt()
      });
      break;

    // LIMPAR FORMULA DE RESTRINÇÃO
    case "3":
      config.restrincao = []
      console.log(`

# FORMULAS DE RESTRINÇÕES LIMPAS


      `)
      break;

    // ADICIONAR QTD VARIÁVEIS NÃO NEGATIVAS 
    case "4":
      rl.question("Informe a qtd de variáveis não negativas: ", function (answer) {
        config.naoNegativos = answer

        rl.prompt()
      });
      break;

    // CALCULAR
    case "5":
      clear()
      const simplex = new Simplex(config.naoNegativos, config.objetiva, config.restrincao)
      const result = simplex.calc()
      
      
      console.log(`
========================================================================================

            RESULTAADO DOS CALCULOS SIMPLEX

            SOLUÇÃO: ${result.solucao}
            STATUS: ${result.status}

            MATRIZ: 
            
${result.matriz.map(data => `\t\t${data.join('  |  ')} \n`).join('')}


========================================================================================
      `);
      break;

    // AJUDA
    case "6":      
      console.log(`
=========================================================================================


      # ADICIONANDO FORMULA DE RESTRINÇÃO #

      Para poder adicionar uma formúla basta escolher a opção e colocar os valores
      separados por espaço. ex:
      
        Formula: 2x1 + x2 - 10x3 = 20

        Como adicionar no sistema: 2 1 -10 20


------------------------------------------------------------------------------------------

      
      # ADICIONANDO FORMULA DE OBJETIVA #

      Para poder adicionar uma formúla basta escolher a opção e colocar os valores
      separados por espaço.ex:

        Formula: Z = 2x1 - x3

      Como adicionar no sistema: 2 -1


========================================================================================
      `);
      console.log(config);
      
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
