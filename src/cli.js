import { defn, syn, ant, ex, wotd } from './utils'

export function cli (argsArray) {
  const cmd = argsArray[2] || 'wotd'
  const queryword = argsArray[3]

  switch (cmd) {
    case 'defn':
      defn(queryword)
      break
    case 'syn':
      syn(queryword)
      break
    case 'ant':
      ant(queryword)
      break
    case 'ex':
      ex(queryword)
      break
    case 'wotd':
      wotd()
      break
    default:
      break
  }
}
