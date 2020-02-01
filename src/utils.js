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

export async function defn (word) {
  const url = getURL('getWordDefination', word)
  const response = await axios({
    method: 'get',
    url: url
  })
  if (response && response.status === 200) {
    var msg = `Definitions for '${word}' are :\n`
    console.log(msg)
    let finalResponse = response.data
    finalResponse = finalResponse.map(definition => definition.text)
    for (let i = 0; i < finalResponse.length; i++) {
      console.log('- ' + finalResponse[i])
    }
  }
}
