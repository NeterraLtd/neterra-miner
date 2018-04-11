const ClaymoreETH = require('./claymore-eth');

const API = {
  'claymore-eth': new ClaymoreETH({
    host: '127.0.0.1',
    port: 3333
  })
}

module.exports = API
