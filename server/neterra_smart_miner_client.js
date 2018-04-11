const config = require('../lib/config');
const Neterra_Miner = require('../lib/server/neterra_miner');
const Logs = require('../lib/server/logs');

var config_server = config.server.get() || {}

if (!config_server.smart){
  config_server.smart = config.defaults.get().smart
  config.server.set(config_server)
  config_server = config.server.get()
}

var socket = require('socket.io-client')(config_server.smart);
var miner = new Neterra_Miner(config);
var logs = new Logs(miner)
var scope = null

socket.on('connect', function(){
  console.log(`Connect to smart server`);
})

socket.on('error', function(data){
  console.log(data);
})

socket.on('whois', function(fn){
  fn({
    err: null,
    data: {
      type: "rig",
      id: config_server.rig_id
    }
  })
})

socket.on('scope', function(scope_id){
  scope = scope_id
})

socket.on('list', function(fn){
  miner.processes.list(function(err, result){
    fn({
      err: err,
      data: result
    })
  })
})

socket.on('start', function(config_name, fn){
  miner.processes.start(config_name, function(err, result){
    fn({
      err: err
    })
  })
})

socket.on('stop', function(config_name, fn){
  miner.processes.stop(config_name, function(err, result){
    fn({
      err: err
    })
  })
})

socket.on('registration:id', function(data){
  var result = data
  result['event'] = 'registration:id'
  process.send(JSON.stringify(result));
})

socket.on('registration:error', function(data){
  var result = data
  result['event'] = 'registration:error'
  process.send(JSON.stringify(result));
})

socket.on('configs:list', function(data){
  var result = data
  result['event'] = 'configs:list'
  process.send(JSON.stringify(result));
})



logs.on('miner:log', function(data){
  process.send(JSON.stringify(data));
  socket.emit('miner:log', data)
})

logs.on('miner:event', function(data){
  socket.emit('miner:event', data)
})

logs.on('miner:stats', function(data){
  socket.emit('miner:stats', data)
})

logs.on('miner:error', function(data){
  socket.emit('miner:error', data)
})



process.on('message', function(pmsg){
  var msg = pmsg || '{}'
  msg.data.cmd = msg.data.cmd || ''

  switch (msg.data.cmd) {
    case 'registration':
      socket.emit('registration', msg.data.data)
      break;
    case 'configs:get':
      socket.emit('configs:get')
      break;
  }
})
