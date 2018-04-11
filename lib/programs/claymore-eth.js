const Socket = require('net')
const STRATUM_GET_STATUS = '{"id":0,"jsonrpc":"2.0","method":"miner_getstat1"}'


const ClaymoreETH = function(){
  this.stats = function(cb){
    try{
      var socket = Socket.Socket();
      socket.setEncoding('ascii');
      socket.on('data', function(result) {
        try{
          var data = JSON.parse(result)
          var res = {
            version: data.result[0].split(' - ')[0],
            currency: data.result[0].split(' - ')[1],
            runtime: data.result[1],
            hashs: data.result[2].split(';')[0],
            sharess: data.result[2].split(';')[1],
            rejected: data.result[2].split(';')[2],
            gpus_hash: data.result[3].split(';'),
            temperature: data.result[6].split(';'),
            error: data.error
          }
          return cb(null, res)
        }catch(e){
          return cb(e, null)
        }
      });
      socket.on('error', function(error){
        return cb(error, null)
      })
      socket.connect(3333, '127.0.0.1');
      socket.write(STRATUM_GET_STATUS);
      socket.end();
    }catch(err){
      return cb(e, null)
    }
  }
}

module.exports = ClaymoreETH
