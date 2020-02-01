const config = require('../configuration/config.json')
const constants = require('./constants.json')
const apikey = config.api_key
const apihost = config.apihost
const axios = require('axios')

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
    .catch(err => console.log(err))
}

export async function syn (word) {
  const functionName = 'getRelatedWords'
  const url = getURL(functionName, word)
  const mainMsg = `## Synonyms for '${word}' are :`
  await sendRequest(url)
    .then(response => handleResponse(response.data, functionName))
    .then(response => printOutput(mainMsg, response, functionName))
    .catch(err => console.log(err))
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
    .catch(err => console.log(err))
}

export async function ex (word) {
  const functionName = 'getExamples'
  const url = getURL(functionName, word)
  const mainMsg = `## Examples for '${word}' are :`
  await sendRequest(url)
    .then(response => handleResponse(response.data, functionName))
    .then(response => printOutput(mainMsg, response, functionName))
    .catch(err => console.log(err))
}

export async function fullWord (word) {
  await defn(word)
  await ex(word)
  await syn(word)
  await ant(word)
}
export async function wotd () {
  const functionName = 'getRandomWord'
  const url = getURL(functionName)
  const mainMsg = '## Word of the day is :'
  await sendRequest(url)
    .then(response => handleResponse(response.data, functionName))
    .then(response => printOutput(mainMsg, response, functionName))
    .catch(err => console.log(err))
}
