const _ = require('lodash')
const Table = require('cli-table')
module.exports = class Simplex {
  constructor(qtdNaoNegativos, objetiva, restrictions) {
    // quantidade de valores não negativos
    this.naoNegativos = qtdNaoNegativos

    // valor de objetiva
    this.objetiva = objetiva

    // toda restrição deve ser <=
    this.restrictions = restrictions

    this.cicle = 1 // quantidade de ciclos para achar o valor

    this.table = []
  }

  calc(self, recursive) {

    // atualizando table quando entra no modo recursivo
    this.table = self ? self.table : this.table

    if (!recursive) {
      this.tableCalcutorBase()
    }

    const pivot = this.pivot()
    
    this.printCicle(this.cicle)
    
    // retornando o novo table já modificado com pivot
    // e testando se esta ok com solução otima
    this.table = this.table.map((_, i) => {
      if (pivot.novaLinhaPivot.index !== i) {
        return this.atualizarLinhas(pivot, i)
      } else {
        return pivot.novaLinhaPivot.value
      }
    })
    
    console.log(this.table);
    // testando para saber se tem algum valor negativo no primeira linha caso sim 
    // vai reiniciar os calculos com o novo tableau
    if (this.table[0].find(data => data < 0)) {
      try {
        this.cicle++
        return this.calc(this, true)
      } catch (e) {
        this.print({
          matriz: this.table,
          solucao: this.table.map(data => data[0] === 1 ? data[data.length - 1] : undefined)
            .find(data => data !== undefined),
          status: 'Múltiplas soluções'
        })
      }
    } else {
      this.print({
        matriz: this.table,
        solucao: this.table.map(data => data[0] === 1 ? data[data.length - 1] : undefined)
          .find(data => data !== undefined),
        status: 'Solução ótima'
      })
    }
  }

  // solução do calculo simplex
  // solutionCalc() {
  //   const solucao = []
  //   let tableColumn = []
  //   let hasOnlyZeroOrOne = []

  //   for (let i = 1; i <= this.restrictions.length + this.naoNegativos; i++) {
  //     tableColumn = this.table.map(data => data[i])

  //     // verificando se só tem 1 ou 0 para poder pegar o valor de folga e resultado
  //     hasOnlyZeroOrOne = tableColumn.filter(data => data === 0 || data === 1)

  //     if (!_.isEmpty(hasOnlyZeroOrOne)) {
  //       if (hasOnlyZeroOrOne.length === tableColumn.length) {
  //         // console.log('filter -->', hasOnlyZeroOrOne);
  //         // console.log('all -->', tableColumn);
  //         // console.log(tableColumn, i)
  //         // vendo o valor de Xn
  //         solucao.push({
  //           folga: i > this.restrictions.length ? this.table[hasOnlyZeroOrOne.indexOf(1)][this.table[0].length - 1] : 0,
  //           value: i <= this.restrictions.length ? this.table[hasOnlyZeroOrOne.indexOf(1)][this.table[0].length - 1] : 0,
  //           index: i
  //         })
  //       }
  //     }
  //   }


  //   console.log(solucao, this.objetiva);
  //   console.log(solucao.map(data => {
  //     console.log(this.objetiva[data.index - 1]);
  //     console.log(data.value);

  //     return this.objetiva[data.index - 1] * data.value
  //   }));

  //   return solucao
  // }

  // toda não negatividade deve ser >= 0

  tableCalcutorBase() {
    // ---- primeira linha do tableau ----

    // lendo objetiva
    let tableTemp = [1] // variable Z

    for (var i = 0; i < this.restrictions.length + this.naoNegativos; i++) {
      tableTemp.push(this.objetiva[i] ? (parseInt(this.objetiva[i]) * -1) : 0)
    }

    tableTemp.push(0) // variable b

    // gravando primeira linha
    this.table.push(tableTemp)

    // ---- restante do tableau ----

    this.restrictions.forEach((restriction, restrictionsIndex) => {
      tableTemp = [0] // variavel Z linha seguinte do tableau

      for (var i = 0; i < this.restrictions.length + this.naoNegativos; i++) {
        tableTemp.push(restriction.coefficient[i] ?
          parseInt(restriction.coefficient[i]): (restrictionsIndex + this.restrictions.length == i ? 1 : 0))
      }
      // adicionando o resultado da função no tablaeu
      tableTemp.push(parseInt(restriction.result))

      // adicionando a linha no tablaeu
      this.table.push(tableTemp)
    })
  }

  pivot() {
    // pegando a linha que entra com base no tableau
    let linhaEntra = {
      index: this.table[0].indexOf(_.min(this.table[0])),
      value: _.min(this.table[0])
    }
    console.log(linhaEntra);
    
    let novaLinhaPivot = this.linePivotCalc(linhaEntra.index)
    console.log(novaLinhaPivot);
    
    return {
      novaLinhaPivot,
      linhaEntra
    }
  }

  /**
   * Calculando a linha do pivot
   */
  linePivotCalc(linhaEntra) {
    const resultCalc = []
    let pivot = 0

    this.table.map((data, index) => {
      if (index !== 0) { // lendo a linha que não seja a primeira
        if (data[linhaEntra] !== 0) {
          let calcPivot = data[data.length - 1] / data[linhaEntra]
          calcPivot >= 0 ? resultCalc.push({
            result: calcPivot,
            value: data[linhaEntra],
            index
          }) : undefined
        }
      }
    })

    // linha pivot original
    pivot = _.minBy(resultCalc, o => o.result)

    // if (!pivot) throw 'treta'

    return {
      ...pivot,
      value: this.table[pivot.index].map(data => data / pivot.value)
    }
  }

  /**
   * Calculando nova primeira linha
   */
  atualizarLinhas(pivot, tableIndex) {
    const novaPrimeiraLinha = []
    const nnPivot = pivot.novaLinhaPivot.value.map(data => data * (this.table[tableIndex][pivot.linhaEntra.index] * -1))

    this.table[tableIndex].forEach((dataTable, i) => {
      novaPrimeiraLinha.push(this.table[tableIndex][i] + nnPivot[i])
    })

    return novaPrimeiraLinha
  }

  /**
   * Print table of the user
   * see what the informations
   * */
  printTable(data) {
    const tableuOrigin = data || [...this.table]

    const headers = []
    for (let i = 1; i <= this.naoNegativos + this.restrictions.length; i++) { // criando um array com os headers do tableau
      headers.push(`x${i}`)
    }

    // instantiate
    const table = new Table({
      head: [...headers, 'b']
    })

    // inserindo cada linha no tableau
    tableuOrigin.map(data => {
      table.push(data.slice(1))
    })

    if (data) {
      return table.toString()
    } else {
      console.log(table.toString())
    }
  }

  print(data) {
    console.log(`
========================================================================================

            RESULTADO DOS CALCULOS SIMPLEX

            SOLUÇÃO: ${data.solucao}
            STATUS: ${data.status}

            TABLEAU:            
${this.printTable(data.matriz)}
      `);
  }

  printCicle(i) {
    console.log(`
========================================================================================

            CICLO ${i}

            TABLEAU:            
${this.printTable(this.table)}
      `);
  }
}