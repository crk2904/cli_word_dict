import { defn } from './utils'

export function cli (argsArray) {
  const cmd = argsArray[2] || 'randomWord'
  const queryword = argsArray[3]

  switch (cmd) {
    case 'defn':
      defn(queryword)
      break
    default:
      console.error(`"${cmd}" is not a valid command!`)
      break
  }
}
