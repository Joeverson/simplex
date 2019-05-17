const _ = require('lodash')

module.exports = class Simplex {
  constructor(qtdNaoNegativos, objetiva, restrictions) {
    // quantidade de valores não negativos
    this.naoNegativos = qtdNaoNegativos

    // valor de objetiva
    this.objetiva = objetiva

    // toda restrinção deve ser <=
    this.restrictions = restrictions

    this.table = []
  }

  calc(table, recursive) {

    // atualizando table quando entra no modo recursivo
    this.table = table || this.table

    if (!recursive) {
      this.tableCalcutorBase()
    }

    const pivot = this.pivot()

    // retornando a nova tabel já modificada com pivot
    // e testando se esta ok com solução otima
    this.table = this.table.map((_, i) => {
      if (pivot.novaLinhaPivot.index !== i) {
        return this.atualizarLinhas(pivot, i)
      } else {
        return pivot.novaLinhaPivot.value
      }
    })

    // testando para saber se tem algum valor negativo no primeira linha caso sim 
    // vai reiniciar os calculos com a nova table
    if (this.table[0].find(data => data < 0)) {
      try {
        return this.calc(this.table, true)
      } catch (e) {
        return {
          matriz: this.table,
          solucao: this.solucao(),
          status: 'Múltiplas soluções'
        }
      }
    } else {
      return {
        matriz: this.table,
        solucao: this.solucao(),
          status: 'Solução ótima'
      }
    }
  }

// solução do calculo simplex
solutionCalc() {
  const solucao = []
  let tableColumn = []
  let hasOnlyZeroOrOne = []

  for (let i = 1; i <= this.restrictions.length + this.naoNegativos; i++) {
    tableColumn = this.table.map(data => data[i])

    // verificando se só tem 1 ou 0 para poder pegar o valor de folga e resultado
    hasOnlyZeroOrOne = tableColumn.filter(data => data === 0 || data === 1)

    if (!_.isEmpty(hasOnlyZeroOrOne)) {
      if (hasOnlyZeroOrOne.length === tableColumn.length) {
        // console.log('filter -->', hasOnlyZeroOrOne);
        // console.log('all -->', tableColumn);
        // console.log(tableColumn, i)
        // vendo o valor de Xn
        solucao.push({
          folga: this.table[hasOnlyZeroOrOne.indexOf(1)][this.table[0].length - 1],
          value: '',
          index: ''
        })
      }
    }
  }

  console.log(solucao);
  
  return solucao
}

  // toda não negatividade deve ser >= 0

  tableCalcutorBase() {
    // ---- primeira linha da table ----

    // lendo objetiva
    let tableTemp = [1] // variable Z

    for (var i = 0; i < this.restrictions.length + this.naoNegativos; i++) {
      tableTemp.push(this.objetiva[i] ? (this.objetiva[i] * -1) : 0)
    }

    tableTemp.push(0) // variable b

    // gravando promeira linha
    this.table.push(tableTemp)

    // ---- restante da table ----

    this.restrictions.forEach((restriction, restrictionsIndex) => {
      tableTemp = [0] // variavel Z linha seguinte da table

      for (var i = 0; i < this.restrictions.length + this.naoNegativos; i++) {
        tableTemp.push(restriction.coefficient[i] ?
          restriction.coefficient[i] : (restrictionsIndex + this.restrictions.length == i ? 1 : 0))
      }
      tableTemp.push(restriction.result)
      this.table.push(tableTemp)
    })
  }

  pivot() {
    // pegando o linha que entra com base na table
    let linhaEntra = {
      index: this.table[0].indexOf(_.min(this.table[0])),
      value: _.min(this.table[0])
    }
    let novaLinhaPivot = this.linePivotCalc(linhaEntra.index)

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
      if (index !== 0) { // lendo a linque que não seja a primeira
        let calcPivot = data[data.length - 1] / data[linhaEntra]
        calcPivot >= 0 ? resultCalc.push({
          result: calcPivot,
          value: data[linhaEntra],
          index
        }) : undefined
      }
    })
    
    // linha pivot original
    pivot = _.minBy(resultCalc, o => o.result)
    
    if (!pivot) throw 'treta'

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
}