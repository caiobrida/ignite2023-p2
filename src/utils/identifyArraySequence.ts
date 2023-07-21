export function identifyArraySequence(
  array: Array<object>,
  paramName: string,
  condition: any,
) {
  let highSequence = 0
  let actualSequence = 0

  for (let i = 0; i < array.length; i++) {
    if (array[i][paramName] === condition) {
      actualSequence++
    } else {
      highSequence = Math.max(highSequence, actualSequence)
      actualSequence = 0
    }
  }

  // Verificar novamente após o loop, pois a maior sequência pode terminar no final da tabela
  highSequence = Math.max(highSequence, actualSequence)

  return highSequence
}
