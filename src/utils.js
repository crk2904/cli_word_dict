import inquirer from 'inquirer'
const config = require('../configuration/config.json')
const constants = require('./constants.json')
const apikey = config.api_key
const apihost = config.apihost
const axios = require('axios')
let hintCount = 0

function getURL (cmd, word) {
  var data = {}
  data.apihost = apihost
  data.apikey = apikey
  data.word = word
  let uriPattern = constants.uri[cmd]
  var idkeys = Object.keys(data)
  for (var i = 0, length = idkeys.length; i < length; i++) {
    var urlParam = '{' + idkeys[i] + '}'
    /* istanbul ignore else */
    if (uriPattern.indexOf(urlParam) !== -1) {
      uriPattern = uriPattern.replace(urlParam, data[idkeys[i]])
      // delete the id from data
      delete data[idkeys[i]]
    }
  }
  return uriPattern
}

function sendRequest (url) {
  return axios({
    method: 'get',
    url: url
  })
}

function handleResponse (response, functionName) {
  let finalResponse
  if (functionName === 'getWordDefination') {
    finalResponse = response.map(definition => definition.text)
  } else if (functionName === 'getRelatedWords') {
    for (let i = 0; i < response.length; i++) {
      if (response[i].relationshipType === 'synonym') {
        finalResponse = response[i].words
      }
    }
  } else if (functionName === 'getAntonyms') {
    let isAntonym = false
    for (let i = 0; i < response.length; i++) {
      if (response[i].relationshipType === 'antonym') {
        finalResponse = response[i].words
        isAntonym = true
        break
      }
    }
    if (!isAntonym) {
      finalResponse = false
    }
  } else if (functionName === 'getExamples') {
    const dummyRes = response.examples
    finalResponse = dummyRes.map(definition => definition.text)
  } else if (functionName === 'getRandomWord') {
    finalResponse = response.word
  }
  return Promise.resolve(finalResponse)
}

async function printOutput (mainMsg, response, functionName) {
  switch (functionName) {
    case 'getWordDefination':
    case 'getRelatedWords':
    case 'getExamples':
      console.log(mainMsg)
      for (let i = 0; i < response.length; i++) {
        console.log('- ' + response[i])
      }
      break
    case 'getRandomWord':
      console.log(mainMsg + response)
      await fullWord(response)
      break
  }
}
export async function defn (word) {
  const functionName = 'getWordDefination'
  const url = getURL(functionName, word)
  const mainMsg = `## Definitions for '${word}' are :`
  await sendRequest(url)
    .then(response => handleResponse(response.data, functionName))
    .then(response => printOutput(mainMsg, response, functionName))
    .catch(err => console.log(err.response.data.error))
}

export async function syn (word) {
  const functionName = 'getRelatedWords'
  const url = getURL(functionName, word)
  const mainMsg = `## Synonyms for '${word}' are :`
  await sendRequest(url)
    .then(response => handleResponse(response.data, functionName))
    .then(response => printOutput(mainMsg, response, functionName))
    .catch(err => console.log(err.response.data.error))
}

export async function ant (word) {
  const functionName = 'getRelatedWords'
  const url = getURL(functionName, word)
  const mainMsg = `## Antonyms for '${word}' are :`
  const noAntonymsMsg = `Antonyms for '${word}' are not present!`
  await sendRequest(url)
    .then(response => handleResponse(response.data, 'getAntonyms'))
    .then(response => {
      if (response === false) {
        console.log(noAntonymsMsg)
      } else {
        printOutput(mainMsg, response, functionName)
      }
    })
    .catch(err => console.log(err.response.data.error))
}

export async function ex (word) {
  const functionName = 'getExamples'
  const url = getURL(functionName, word)
  const mainMsg = `## Examples for '${word}' are :`
  await sendRequest(url)
    .then(response => handleResponse(response.data, functionName))
    .then(response => printOutput(mainMsg, response, functionName))
    .catch(err => console.log(err.response.data.error))
}

export async function fullWord (word) {
  defn(word)
    .then(ex(word))
    .then(syn(word))
    .then(ant(word))
}
export async function wotd () {
  const functionName = 'getRandomWord'
  const url = getURL(functionName)
  const mainMsg = '## Word of the day is :'
  await sendRequest(url)
    .then(response => handleResponse(response.data, functionName))
    .then(response => printOutput(mainMsg, response, functionName))
    .catch(err => console.log(err.response.data.error))
}

export async function play () {
  const functionName = 'getRandomWord'
  const url = getURL(functionName)
  await sendRequest(url)
    .then(response => playGameFunction(response.data.word))
    .catch(err => console.log(err.response.data.error))
}

class HintDataStore {
  constructor () {
    this.defn = []
    this.syn = []
    this.ant = []
  }

  clearHints () {
    this.defn = []
    this.syn = []
    this.ant = []
  }
}

async function playGameFunction (word) {
  var hintDS = new HintDataStore()
  let functionName = 'getWordDefination'
  let url = getURL(functionName, word)
  await sendRequest(url)
    .then(async (response) => {
      hintDS.defn = await handleResponse(response.data, functionName)
    })
  functionName = 'getExamples'
  url = getURL(functionName, word)
  await sendRequest(url)
    .then(async (response) => {
      hintDS.ex = await handleResponse(response.data, functionName)
    })
  functionName = 'getRelatedWords'
  url = getURL(functionName, word)
  await sendRequest(url)
    .then(async (response) => {
      hintDS.syn = await handleResponse(response.data, functionName)
    })
  await sendRequest(url)
    .then(async (response) => {
      const res = await handleResponse(response.data, 'getAntonyms')
      if (res) {
        hintDS.ant = res
      } else {
        hintDS.ant = []
      }
    })
  console.log('=====GUESS THE WORD========')
  await playGame(hintDS, word, displayQuestion)
}

async function playGame (hintDS, word, functionName) {
  inquirer
    .prompt([
      {
        name: 'ans',
        message: functionName(hintDS, word)
      }
    ])
    .then(answers => {
      if (answers.ans === word || hintDS.syn.includes(answers.ans)) {
        inquirer.prompt([
          {
            name: 'option',
            message: 'Whoaaa Genius!! Right Answer!! Want to play again (Y/N)? '
          }
        ]).then(answers => {
          if (answers.option.toLowerCase() === 'y') {
            play()
          } else {
            console.log('Thanks for playing with us!!!!')
          }
        })
      } else {
        wrongAnswer(hintDS, word)
      }
    })
}
function displayQuestion (hintDS, word) {
  const randomIndexDefn = Math.floor((Math.random() * (hintDS.defn.length - 1 + 1)) + 1)
  const randomIndexEx = Math.floor((Math.random() * (hintDS.ex.length - 1 + 1)) + 1)
  const randomIndexSyn = Math.floor((Math.random() * (hintDS.syn.length - 1 + 1)) + 1)
  const keys = ['defn', 'syn', 'ex'] // as antonyms are not always present hence avoiding it as
  let hintKey = keys[Math.floor((Math.random() * (2)) + 1)]
  switch (hintKey) {
    case 'defn':
      console.log('# Defination of word is: ', hintDS.def[randomIndexDefn])
      break
    case 'ex':
      console.log('# Example of word is: ', hintDS.ex[randomIndexEx])
      break
    case 'syn':
      console.log('# Synonym of word is: ', hintDS.syn[randomIndexSyn])
      break
  }
  hintKey = ''
}
function displayPlayAgainMenu () {
  console.log('Oops.. Wrong Guess')
  console.log('1. Guess Again')
  console.log('2. Hint')
  console.log('3. Quit')
}
function showHint (hintDS, word) {
  hintCount = hintCount + 1
  const keys = ['defn', 'syn', 'ex', 'jumbledWord']
  let hintKey = keys[Math.floor((Math.random() * (3)) + 1)]
  let randomIndex
  if (hintKey !== 'jumbledWord') {
    randomIndex = Math.floor((Math.random() * (hintDS[hintKey].length - 1 + 1)) + 1)
  }
  switch (hintKey) {
    case 'defn':
      console.log('Hint : Defination of word is: ', hintDS.def[randomIndex])
      break
    case 'ex':
      console.log('Hint : Example of word is: ', hintDS.ex[randomIndex])
      break
    case 'syn':
      console.log('Hint : Synonym of word is: ', hintDS.syn[randomIndex])
      break
    case 'ant':
      console.log('Hint : Antonym of word is: ', hintDS.ant[randomIndex])
      break
    case 'jumbledWord':
      console.log('Hint : Jumbled word is', jumbleTheWord(word))
  }
  hintKey = ''
}
function wrongAnswer (hintDS, word) {
  inquirer
    .prompt([
      {
        name: 'option',
        message: displayPlayAgainMenu(hintDS)
      }
    ])
    .then(answers => {
      switch (answers.option) {
        case '1':
          inquirer
            .prompt([
              {
                name: 'ans',
                message: 'Guess again: '
              }
            ])
            .then(answers => {
              if (answers.ans === word || hintDS.syn.includes(answers.ans)) {
                inquirer.prompt([
                  {
                    name: 'option',
                    message: 'Whoaaa Genius!! Right Answer!! Want to play again (Y/N)? '
                  }
                ]).then(answers => {
                  if (answers.option.toLowerCase() === 'y') {
                    play()
                  } else {
                    console.log('Thanks for playing with us!!!!')
                  }
                })
              } else {
                wrongAnswer(hintDS, word)
              }
            })
          break
        case '2':
          if (hintCount > 2) {
            hintDS.clearHints()
            // more than 3 hints option is causing memory leak hence restricting the hints
            console.log('Maximum number of Hints achieved!!! Correct Answer : ', word)
            fullWord(word)
            break
          }
          playGame(hintDS, word, showHint)
          break
        case '3':
          hintDS.clearHints()
          console.log('Correct Answer : ', word)
          fullWord(word)
          break
      }
    })
}

function jumbleTheWord (word) {
  word = word.split('')
  for (var i = word.length - 1; i >= 0; i--) {
    var rand = Math.floor(Math.random() * i)
    var temp = word[i]
    word[i] = word[rand]
    word[rand] = temp
  }
  word = word.join('')
  return word
}
