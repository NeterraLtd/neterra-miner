"use strict"

const EventEmitter = require('events').EventEmitter
const util = require('util')
const pm2 = require('pm2');
const path = require('path');
const async = require('async');
const config = require('../config');

const gen_process = function(app){
  return {
    "name": app.name.replace('neterra_miner_',''),         // nanopool
    "coin_tag": null,     // eth
    "default": null,
    "params": null,
    "program": {
      "name": null,
      "version": null
    },
    "status": {
      "name":app.name,
      "pid":app.pid,
      "id":app.pm_id,
      "cpu":app.monit.cpu,
      "mem":app.monit.memory,
      "status":app.pm2_env.status,
      "uptime":app.pm2_env.pm_uptime,
      "restarts":app.pm2_env.restart_time
    }
  }
}


function start_pm2_process(program, callback){
  try{
    if (program){
      pm2.connect(function(err){
        if (err) {
          pm2.disconnect();
          return callback(err)
        }
        pm2.start({
          name      : 'neterra_miner_'+program.name,
          script    : path.join(path.parse(process.mainModule.filename).dir, '..', 'lib', 'process','app.js'),
          exec_mode : 'fork',
          instances : 1,
          args      : `'${JSON.stringify(program.args)}'`
        }, function(err, apps) {
          // console.log(err, apps);
          pm2.disconnect();
          callback(err)
        });
      })
    }else{
      pm2.disconnect();
      return callback(true, null)
    }
  }catch(e){
    pm2.disconnect();
    return callback(e, null)
  }
}


function stop_pm2_process(proc, callback){
  var pm2_id = proc.status.id
  if (!pm2_id || !isNaN(pm2_id)){
    pm2.connect(function(err){
      if(err){
        pm2.disconnect();
        callback(err)
      }
      pm2.stop(pm2_id,function(err){
        pm2.disconnect();
        callback(err)
      })
    })
  }
}



const Neterra_Mining_Processor = function(config, client_events){

  var self = this;
  var current = {}

// client_events = true
  // if (client_events){
  //
  // }


  this.neterra_smart_miner = {
    connect: function(callback){
      pm2.connect(function(err){
        if (err) {
          process.exit(2);
        }
        pm2.start({
          name      : 'Neterra_Smart_Miner_Client',
          script    : path.join(path.parse(process.mainModule.filename).dir, '..', 'server', 'neterra_smart_miner_client.js'),
          exec_mode : 'fork',
          instances : 1
        }, function(err, apps) {
          pm2.disconnect();
          callback(err, 'Neterra Smart-Miner client connect')
        });
      })
    },
    disconnect: function(callback){
      pm2.connect(function(err){
        if (err) {
          process.exit(2);
        }
        pm2.stop('Neterra_Smart_Miner_Client',function(err){
          pm2.disconnect();
          callback(err, 'Neterra Smart-Miner clinet disconnect')
        })
      })
    },
    emit: function(func, data, callback){
      pm2.connect(function(err){
        if (err) {
          pm2.disconnect();
          if (callback) callback(err, null)
        }

        pm2.list(function(err, pm2_apps){
          if (err) {
            pm2.disconnect();
            if (callback) callback(err, null)
          }

          var app = pm2_apps.find(function(item){if(item.name=='Neterra_Smart_Miner_Client') return true})

          if (app){
            pm2.sendDataToProcessId(app.pm_id, {
              data : {
                'cmd':func,
                'data': data
              },
              type : 'process:msg',
              topic: 'topic',
              id   : app.pm_id
            },
            function (err, res){
              // callback(err, res)
            })
            pm2.launchBus(function(err, bus) {
              bus.on('process:msg', function(packet) {

                if (callback) {
                  try{
                    var raw = JSON.parse(packet.raw)
                    callback(null, raw.data)
                  }catch(e){
                    callback(e)
                  }
                } else {
                  if (packet.err){
                    self.emit('error', packet.err)
                  }
                  try{
                    var raw = JSON.parse(packet.raw)
                    if (raw.event){
                     self.emit(raw.event, raw.err, raw.data)
                    }
                  }catch(e){
                    self.emit('error', e)
                  }
               }
                pm2.disconnect();
              });

            });
          }else{
            if (callback) callback(`Neterra_Smart_Miner_Client not start.`, null)
          }
        })
      })
    }
  }


  this.processes = {
    list: function(callback){
      pm2.connect(function(err){
        if (err){
          pm2.disconnect();
          return callback(err, null)
        }
        pm2.list(function(err, pm2_apps){
          if (err){
            pm2.disconnect();
            return callback(err, null)
          }
          var processes = []
          self.neterra_smart_miner.emit('configs:get', {}, function(err, configs){
            if (err){
              pm2.disconnect();
              return callback(err, null)
            }
            pm2_apps.forEach(function(app){
              if (app.name.indexOf('neterra_miner_') === 0){
                var data = gen_process(app)
                var config = configs.find(function(item){if(item.name === data.name) return true })
                if (config){
                  data["coin_tag"] = config.coin.tag
                  data["params"] = config.params
                  data["program"] = {
                    "name": config.program.name,
                    "version": config.program.version
                  },
                  processes.push(data)
                }
              }
            })
            pm2.disconnect();
            callback(null, processes)
          })
        })
      })
    },
    start: function(config_name, callback){
      self.neterra_smart_miner.emit('configs:get', {}, function(err, configs){
        if (err) return callback(err)
        var programs = config.programs.get()
        var config_data = configs.find(function(item){if(item.name === config_name) return true })
        if (!config_data) return callback('Config not found.')
        var program = programs.find(function(item){if(item.name === config_data.program.name) return true })

        var matchvar = /^{{.*}}$/

        var params = config_data.params.map(function(item){
          item = item.replace('{{pool_host}}',config_data.pool_host)
          item = item.replace('{{address}}',config_data.address)
          item = item.replace('{{pool_user}}',config_data.pool_user)
          item = item.replace('{{pool_password}}',config_data.pool_password)
          item = item.replace('{{rigid}}',config.server.get().name)
          return item
        })

        var params = {
          name: config_data.name,
          execute: program.location,
          args: {
            name: config_data.name,
            execute: program.location,
            coin: config_data.coin,
            program: config_data.program,
            variables: program.variables,
            params: params
          }
        }
        start_pm2_process(params, function(err, result){
          callback(err)
        })

      })
    },
    stop: function(config_name, callback){
      self.processes.list(function(err, processes){
        if (config_name === 'all'){
          var proc = processes.filter(function(item){
            if(item.status){
              if (item.status.status === 'online') return true
            }
          })
          if (proc.length < 1) return callback('No started processes.')
          async.eachLimit(proc, 1, stop_pm2_process, function(err){
            callback(err)
          });
        }else{
          var proc = processes.find(function(item){if(item.name === config_name) return true })
          if (!proc) return callback('Process not found')
          stop_pm2_process(proc, function(err){
            callback(err)
          })
        }
      })
    }
  }

  this.configs = {
    list: function(callback){
      self.neterra_smart_miner.emit('configs:get', {})
    }
  }

}


util.inherits(Neterra_Mining_Processor, EventEmitter);
module.exports = Neterra_Mining_Processor
